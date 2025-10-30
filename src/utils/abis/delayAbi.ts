export const DELAY_ABI = [
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
