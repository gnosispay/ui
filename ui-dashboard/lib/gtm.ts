/**
 * List of custom GTM events we trigger from the app
 */
export const GTM_EVENTS = {
  PAGE_VIEWS: {
    SIGNUP: "signup:pageview",
    WELCOME: "welcome:pageview",
    KYC_INITIALIZE: "kyc_initialize:pageview",
    KYC_FINISH: "kyc_finish:pageview",
    ORDER_SHIPPING_DETAILS: "order_shipping_details:pageview",
    ORDER_SOURCE_OF_FUNDS: "order_source_of_funds:pageview",
    ORDER_CUSTOMIZE: "order_customize:pageview",
    ORDER_DEPOSIT: "order_deposit:pageview",
    ORDER_STATUS: "order_status:pageview",
  },
  ACTIONS: {
    CONSENT: "consent",
    CONSENT_GRANTED: "consent:granted",
    USER_INITIALIZED: "user:initialized",
    USER_SIGNED_IN: "user:signed_in",
    ORDER_COMPLETE: "order:complete",
    KYC_APPROVED: "kyc:approved",
    KYC_REJECTED: "kyc:rejected",
  },
};

export type GTMEvent =
  | (typeof GTM_EVENTS.PAGE_VIEWS)[keyof typeof GTM_EVENTS.PAGE_VIEWS]
  | (typeof GTM_EVENTS.ACTIONS)[keyof typeof GTM_EVENTS.ACTIONS];

/**
 * Events which can be triggered only once per page load
 */
const SINGLETON_EVENTS = [GTM_EVENTS.ACTIONS.USER_SIGNED_IN];

let userDataInitialized = false;

/**
 * A method used for triggering built-in GTM events for which we need to pass all specified arguments
 */
export function triggerCoreEvent(...args: any) {
  window.dataLayer = window.dataLayer || [];

  // We push all arguments provided to the method
  window.dataLayer.push(args);
}

export const triggerEvent = (event: GTMEvent, data?: any) => {
  /**
   * We make sure `window.dataLayer` is initialized properly before
   * triggering GTM events which are proapgated to all marketing platforms
   */
  if (typeof window.dataLayer === "undefined") {
    setTimeout(() => triggerEvent(event, data), 100);
    return;
  }

  /**
   * We make sure user data is initialized, and custom GTM scripts are
   * loaded properly before triggering any custom GTM events.
   *
   * We use this data for advanced matching when running ads on all platforms.
   *
   * The exception is consent granted event for which we don't require initialized user data.
   */
  if (
    event !== GTM_EVENTS.ACTIONS.CONSENT_GRANTED &&
    event !== GTM_EVENTS.ACTIONS.USER_INITIALIZED &&
    (!userDataInitialized || !window.gtmCustomScriptsLoaded)
  ) {
    setTimeout(() => triggerEvent(event, data), 100);
    return;
  }

  if (event === GTM_EVENTS.ACTIONS.USER_INITIALIZED) {
    /**
     * User data was already initialized and we prevent re-triggering
     */
    if (userDataInitialized) {
      return;
    }

    /**
     * Mark user data as initialized
     */
    userDataInitialized = true;
  }

  /**
   * Some custom events (like `user:signed_in`) can be triggered only once per page load.
   *
   * Here we make sure they are never triggered multiple times as that could affect our users tracking.
   */
  if (
    SINGLETON_EVENTS.includes(event) &&
    window.dataLayer.find((item: any) => item.event === event)
  ) {
    return;
  }

  window.dataLayer.push({ event, ...(data && { ...data }) });
};

export const generateConsentModeChoices = (consentGiven: boolean) => {
  const gtmConsentOption = consentGiven ? "granted" : "denied";

  return {
    ad_storage: gtmConsentOption,
    ad_user_data: gtmConsentOption,
    ad_personalization: gtmConsentOption,
    analytics_storage: gtmConsentOption,
    functionality_storage: gtmConsentOption,
    personalization_storage: gtmConsentOption,
    security_storage: gtmConsentOption,
  };
};
