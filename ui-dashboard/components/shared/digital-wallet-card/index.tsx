"use client";

import React, { useState, useEffect } from "react";
import { X } from "@phosphor-icons/react";
import Image from "next/image";
import { useFeatureFlagEnabled } from "posthog-js/react";
interface DigitalWalletCardProps {
  title: string;
  description: string;
  iconSrc: string;
  iconAlt: string;
  localStorageKey: string;
  featureFlagName: string;
  learnMoreUrl: string;
}

export const DigitalWalletCard = ({
  title,
  description,
  iconSrc,
  iconAlt,
  localStorageKey,
  featureFlagName,
  learnMoreUrl,
}: DigitalWalletCardProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cardCollapsed, setCardCollapsed] = useState<undefined | boolean>(
    undefined,
  );
  const isFeatureEnabled = useFeatureFlagEnabled(featureFlagName);
  const posthogFeatureFlagsInitialized = typeof isFeatureEnabled !== "undefined";

  useEffect(() => {
    if (posthogFeatureFlagsInitialized) {
      const cardCollapsedValue = window.localStorage.getItem(localStorageKey);

      if (cardCollapsedValue === "yes") {
        setCardCollapsed(true);
      }

      setIsLoading(false);
    }
  }, [localStorageKey, featureFlagName, isFeatureEnabled]);

  const collapseCard = () => {
    window.localStorage.setItem(localStorageKey, "yes");
    setCardCollapsed(true);
  };

  if (isLoading || cardCollapsed || !isFeatureEnabled) {
    return null;
  }

  return (
    <div
      style={{ minWidth: "256px" }}
      className="p-4 rounded-xl relative bg-white border border-[#f0ebde]"
    >
      <button onClick={collapseCard} className="absolute top-5.5 right-4 z-10">
        <X size={22} />
      </button>

      <a
        href={learnMoreUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block cursor-pointer hover:opacity-80"
      >
        <div className="pl-2 pt-3 pb-4">
          <Image src={iconSrc} alt={iconAlt} width="40" height="40" />
        </div>

        <p className="text-xl">{title}</p>

        <p className="mt-1 text-sm font-light text-[#6e6c62]">{description}</p>
      </a>
    </div>
  );
};
