import { LiFi } from "@lifi/sdk";

const getLifi = () =>
  new LiFi({
    integrator: "gnosis-pay",
    apiKey: process.env.NEXT_PUBLIC_LIFI_API_KEY,
    rpcs: { 100: ["https://rpc.gnosischain.com/"] },
  });

export default getLifi;
