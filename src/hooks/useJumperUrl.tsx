import { currencies } from "@/constants";
import { useUser } from "@/context/UserContext";
import { useMemo } from "react";

export const useJumperUrl = () => {
  const { safeConfig } = useUser();
  const currency = useMemo(() => {
    if (!safeConfig?.fiatSymbol) return null;
    return currencies[safeConfig.fiatSymbol];
  }, [safeConfig]);

  const url = useMemo(() => {
    const toToken = currency?.jumperAddress ?? currency?.address;
    if (!toToken || !safeConfig?.address) return null;
    return `https://jumper.exchange/?fromChain=1&fromToken=0x0000000000000000000000000000000000000000&toAddress=${safeConfig.address}&toChain=100&toToken=${toToken}`;
  }, [currency, safeConfig?.address]);

  return url;
};
