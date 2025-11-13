export const DELAY_MOD_ABI = [
  {
    inputs: [],
    name: "txNonce",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "queueNonce",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "txCooldown",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "txExpiration",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_nonce", type: "uint256" }],
    name: "getTxCreatedAt",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "skipExpired",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "enableModule",
    type: "function",
    inputs: [{ name: "module", type: "address" }],
  },
  {
    name: "disableModule",
    type: "function",
    inputs: [
      { name: "prevModule", type: "address" },
      { name: "module", type: "address" },
    ],
  },
] as const;
