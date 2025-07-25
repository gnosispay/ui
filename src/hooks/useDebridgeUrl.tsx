import { currencies } from "@/constants";
import { useUser } from "@/context/UserContext";
import { useMemo } from "react";

export const useDebridgeUrl = () => {
  const { safeConfig } = useUser();
  const currency = useMemo(() => {
    if (!safeConfig?.fiatSymbol) return null;
    return currencies[safeConfig.fiatSymbol];
  }, [safeConfig]);

  const url = useMemo(() => {
    if (!currency || !safeConfig?.address) return null;
    return `https://app.debridge.finance/?inputChain=1&outputChain=100&inputCurrency=&outputCurrency=${currency.address}&address=${safeConfig.address}&dlnMode=simple`;
  }, [currency, safeConfig?.address]);

  return url;
};
