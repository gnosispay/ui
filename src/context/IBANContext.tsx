import { getApiV1IbansAvailable } from "@/client";
import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useUser } from "./UserContext";

type IBANContextProps = {
  children: ReactNode | ReactNode[];
};

export type IIBANContext = {
  hasIbanSet: boolean;
  isEligibleForIban: boolean;
};

const IBANContext = createContext<IIBANContext | undefined>(undefined);

const IBANContextProvider = ({ children }: IBANContextProps) => {
  const { user, isUserSignedUp } = useUser();
  const [isEligibleForIban, setIsEligibleForIban] = useState(false);

  const hasIbanSet = useMemo(() => user?.bankingDetails?.moneriumIban !== undefined, [user]);

  const refreshIbanEligibility = useCallback(() => {
    getApiV1IbansAvailable()
      .then(({ data, error }) => {
        if (error) {
          console.error(error);
          return;
        }

        setIsEligibleForIban(data?.data?.available ?? false);
      })
      .catch(console.error);
  }, []);

  // Initialize IBAN eligibility on mount
  useEffect(() => {
    if (!isUserSignedUp) return;

    refreshIbanEligibility();
  }, [isUserSignedUp, refreshIbanEligibility]);

  return (
    <IBANContext.Provider
      value={{
        hasIbanSet,
        isEligibleForIban,
      }}
    >
      {children}
    </IBANContext.Provider>
  );
};

const useIBAN = () => {
  const context = useContext(IBANContext);
  if (context === undefined) {
    throw new Error("useIBAN() must be used within an IBANContextProvider");
  }
  return context;
};

export { IBANContextProvider, useIBAN };
