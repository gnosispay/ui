"use client";

import React, { useState, useEffect } from "react";
import { X } from "@phosphor-icons/react/dist/ssr";

import { twMerge } from "tailwind-merge";
import { IbanCardActionButton } from "./iban-card-action-button";

const LOCAL_STORAGE_KEY = "iban_card_collapsed";

interface IbanCardProps {
  title: string;
  description: string | React.ReactNode;
  buttonText: string;
  onClick: () => void;
  actionDisabled?: boolean;
  collapsable?: boolean;
  classNames?: string;
  requiresConnectedWallet?: boolean;
}
export const IbanCard = ({
  title,
  description,
  buttonText,
  onClick,
  actionDisabled = false,
  collapsable = true,
  requiresConnectedWallet = false,
  classNames = "",
}: IbanCardProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cardCollapsed, setCardCollapsed] = useState<undefined | boolean>(
    undefined,
  );

  useEffect(() => {
    const cardCollapsedValue = window.localStorage.getItem(LOCAL_STORAGE_KEY);

    if (cardCollapsedValue) {
      setCardCollapsed(true);
    }

    setIsLoading(false);
  }, []);

  const collapseCard = () => {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, "yes");
    setCardCollapsed(true);
  };

  if (isLoading || (cardCollapsed && collapsable)) {
    return null;
  }

  return (
    <div
      className={twMerge(
        "flex flex-col justify-between md:max-w-sm p-4 rounded-lg relative",
        classNames,
      )}
      style={{
        background: "linear-gradient(286.66deg, #CDDF52 16.3%, #EBFA96 85.6%)",
        minWidth: "18rem",
      }}
    >
      {collapsable && (
        <button onClick={collapseCard} className="absolute top-5.5 right-4">
          <X size={22} />
        </button>
      )}
      <div>
        <p className="font-medium text-lg">{title}</p>

        <p className="text-sm">{description}</p>
      </div>

      <IbanCardActionButton
        requiresConnectedWallet={requiresConnectedWallet}
        onClick={onClick}
        actionDisabled={actionDisabled}
        buttonText={buttonText}
      />
    </div>
  );
};
