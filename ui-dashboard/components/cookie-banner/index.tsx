"use client";

import { usePostHog } from "posthog-js/react";
import Cookies from "js-cookie";
import React, { useEffect, useState, useRef } from "react";

import {
  GTM_EVENTS,
  triggerCoreEvent as triggerCoreGTMEvent,
  triggerEvent as triggerCustomGTMEvent,
  generateConsentModeChoices as generateGTMConsentModeChoices,
} from "@/lib/gtm";

import ConsentScreen from "./consent-screen";
import ManageCookies from "./manage-cookies";

const TABS = {
  CONSENT_SCREEN: "consent_screen",
  MANAGE_COOKIES: "manage_cookies",
};

const CONSENT_OPTIONS = {
  GRANTED: "yes",
  DENIED: "no",
  UNDECIDED: "undecided",
};

const COOKIE_NAME = "cookie_consent";

const CookieBanner = () => {
  const [activeTab, setActiveTab] = useState(TABS.CONSENT_SCREEN);
  const [consentGiven, setConsentGiven] = useState("");
  const initializedConsentFromStorage = useRef(false);
  const posthog = usePostHog();

  const getCookieDomain = () => {
    const currentUrl = window.location.hostname;

    /**
     * Development environment
     */
    if (currentUrl.includes("localhost")) {
      return "localhost";
    }

    /**
     * Production environment (set a cookie at one level above the current subdomain)
     */
    const domainWithoutSubdomain = currentUrl.split(".").slice(1).join(".");
    return `.${domainWithoutSubdomain}`;
  };

  useEffect(() => {
    const consentValue = Cookies.get(COOKIE_NAME) ?? CONSENT_OPTIONS.UNDECIDED;

    setConsentGiven(consentValue);

    /**
     * Initialize the consent value for GTM
     */
    if (!initializedConsentFromStorage.current) {
      /**
       * User still hasn't made consent choice
       */
      if (consentValue === CONSENT_OPTIONS.UNDECIDED) {
        triggerCoreGTMEvent(
          GTM_EVENTS.ACTIONS.CONSENT,
          "default",
          generateGTMConsentModeChoices(false),
        );
      } else {
        /**
         * User has already made consent choice
         */
        triggerCoreGTMEvent(
          GTM_EVENTS.ACTIONS.CONSENT,
          "update",
          generateGTMConsentModeChoices(
            consentValue === CONSENT_OPTIONS.GRANTED,
          ),
        );
      }

      initializedConsentFromStorage.current = true;
    }
  }, []);

  useEffect(() => {
    if (consentGiven !== "") {
      posthog.set_config({
        // Use cookies as PostHog cookies are required
        persistence: "localStorage+cookie",
      });
    }
    if (posthog.has_opted_out_capturing()) {
      posthog.opt_in_capturing();
    }
  }, [consentGiven, posthog]);

  const handleConsentChange = ({ consentGiven }: { consentGiven: boolean }) => {
    const consentValue = consentGiven
      ? CONSENT_OPTIONS.GRANTED
      : CONSENT_OPTIONS.DENIED;

    Cookies.set(COOKIE_NAME, consentValue, {
      path: "/",
      secure: true,
      expires: 365,
      domain: getCookieDomain(),
    });

    setConsentGiven(consentValue);

    triggerCoreGTMEvent(
      GTM_EVENTS.ACTIONS.CONSENT,
      "update",
      generateGTMConsentModeChoices(consentGiven),
    );

    triggerCustomGTMEvent(GTM_EVENTS.ACTIONS.CONSENT_GRANTED);
  };

  // User has already made a consent choice
  if (consentGiven !== CONSENT_OPTIONS.UNDECIDED) {
    return null;
  }

  return (
    <div className="fixed bottom-5 md:bottom-8 left-5 md:left-8 right-5 md:right-0 z-50 rounded-lg bg-white p-5 shadow-lg max-w-md flex flex-col space-y-6">
      {activeTab === TABS.CONSENT_SCREEN && (
        <ConsentScreen
          onAccept={() => handleConsentChange({ consentGiven: true })}
          manageCookies={() => setActiveTab(TABS.MANAGE_COOKIES)}
        />
      )}

      {activeTab === TABS.MANAGE_COOKIES && (
        <ManageCookies
          goBack={() => setActiveTab(TABS.CONSENT_SCREEN)}
          onSubmit={handleConsentChange}
        />
      )}
    </div>
  );
};

export default CookieBanner;
