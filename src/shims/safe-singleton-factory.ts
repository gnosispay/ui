/**
 * Shim for @safe-global/safe-singleton-factory
 *
 * The original package uses dynamic require() which doesn't work with Vite bundling.
 * This shim provides the static values needed for chain ID 1 (mainnet).
 * The singleton factory address is deterministic and the same across all EVM chains.
 */

interface SingletonFactoryInfo {
  gasPrice: number;
  gasLimit: number;
  signerAddress: string;
  transaction: string;
  address: string;
}

// Static deployment info for the singleton factory (same on all EVM chains)
const SINGLETON_FACTORY_INFO: SingletonFactoryInfo = {
  gasPrice: 100000000000,
  gasLimit: 100000,
  signerAddress: "0xE1CB04A0fA36DdD16a06ea828007E35e1a3cBC37",
  transaction:
    "0xf8a58085174876e800830186a08080b853604580600e600039806000f350fe7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf326a0b1fd9f4102283a663738983f1aac789e979e220a1b649faa74033f507b911af5a061dd0f2f6f2341ee95913cf94b3b8a49cac9fdd7be6310da7acd7a96e31958d7",
  address: "0x914d7Fec6aaC8cd542e72Bca78B30650d45643d7",
};

export const getSingletonFactoryInfo = (_chainId: number): SingletonFactoryInfo => {
  // The singleton factory is deployed at the same address on all chains
  return SINGLETON_FACTORY_INFO;
};
