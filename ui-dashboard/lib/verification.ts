import { JsonRpcProvider } from "ethers";
import { type VerifyOpts } from "siwe";
import type { SiweMessage } from "siwe";

export const verifySmartSignature = async (
  siweMessage: SiweMessage,
  signature: string,
) => {
  const nextAuthUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL!);

  const verifyConfig: VerifyOpts = {
    provider: new JsonRpcProvider(
      `${process.env.GATEWAY_RPC_URL}?apiKey=${process.env.GATEWAY_RPC_KEY}`,
    ),
  };

  return siweMessage.verify(
    {
      signature,
      domain: nextAuthUrl.host,
    },
    verifyConfig,
  );
};
