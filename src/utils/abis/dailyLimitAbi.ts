export const DAILY_LIMIT_ABI = [
  {
    name: "setAllowance",
    type: "function",
    inputs: [
      { name: "token", type: "bytes32" },
      { name: "amount", type: "uint128" },
      { name: "resetTime", type: "uint128" },
      { name: "resetBaseTime", type: "uint128" },
      { name: "resetTimeBuffer", type: "uint64" },
      { name: "resetTimestamp", type: "uint64" },
    ],
  },
] as const;
