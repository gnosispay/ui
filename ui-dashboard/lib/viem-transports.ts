import { http } from "viem";

export const transports = {
  gateway: http(process.env.GATEWAY_RPC_URL, {
    fetchOptions: {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GATEWAY_RPC_KEY}`,
      },
    },
  }),
  gnosisChain: http("https://rpc.gnosischain.com"),
  gnosisDrpc: http("https://gnosis.drpc.org"),
  llamaRpc: http("https://eth.llamarpc.com"),
};
