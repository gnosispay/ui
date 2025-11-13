"use client";

import { DigitalWalletCard } from "../digital-wallet-card";

export const GoogleWalletCard = () => {
  return (
    <DigitalWalletCard
      title="Add to Google Wallet"
      description="Learn how to add your Gnosis Pay card to your Google Wallet"
      iconSrc="/static/google-wallet-icon.svg"
      iconAlt="Google Wallet Icon"
      localStorageKey="google_wallet_card_collapsed"
      featureFlagName="show-google-wallet-banner"
      learnMoreUrl="https://help.gnosispay.com/en/articles/10222921-adding-your-gnosis-pay-card-to-google-wallet"
    />
  );
};
