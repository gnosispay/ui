import { getAddress, getCreate2Address, keccak256, encodePacked, encodeFunctionData, type Address } from "viem";
import { DELAY_MOD_ABI } from "./abis/delayAbi";

// Deployment addresses (from account-kit deployments.ts)
const MODULE_PROXY_FACTORY = "0x000000000000addb49795b0f9ba5bc298cdda236";
const DELAY_MOD_MASTERCOPY = "0x4A97E65188A950Dd4b0f21F9b5434dAeE0BBF9f5";

// Minimal proxy bytecode pattern (EIP-1167)
const PROXY_BYTECODE_PREFIX = "0x602d8060093d393df3363d3d373d3d3d363d73";
const PROXY_BYTECODE_SUFFIX = "5af43d82803e903d91602b57fd5bf3";

/**
 * Encode an address to 32 bytes (64 hex chars) with leading zeros
 */
function encodeAddress(address: string): string {
  const cleanAddress = address.toLowerCase().replace(/^0x/, "");
  if (cleanAddress.length !== 40) {
    throw new Error(`Invalid address length: ${address}`);
  }
  return `0x${cleanAddress.padStart(64, "0")}`;
}

/**
 * Encode uint256 to 32 bytes
 */
function encodeUint256(value: number | bigint): string {
  const hex = typeof value === "bigint" ? value.toString(16) : value.toString(16);
  return `0x${hex.padStart(64, "0")}`;
}

/**
 * Encode the delay module setUp function data
 * This matches account-kit's encodeSetUp function exactly
 * setUp(bytes) where bytes = abi.encode(address, address, address, uint256, uint256)
 */
function encodeDelayModSetUp(safe: string): string {
  const encodedSafe = encodeAddress(safe).slice(2); // Remove 0x prefix
  const encodedZero = encodeUint256(0).slice(2); // Remove 0x prefix
  // Format: address (32 bytes) + address (32 bytes) + address (32 bytes) + uint256 (32 bytes) + uint256 (32 bytes)
  const initializer = `0x${encodedSafe}${encodedSafe}${encodedSafe}${encodedZero}${encodedZero}`;

  // Use viem's encodeFunctionData to match account-kit's iface.encodeFunctionData("setUp", [initializer])
  return encodeFunctionData({
    abi: DELAY_MOD_ABI,
    functionName: "setUp",
    args: [initializer as `0x${string}`],
  });
}

/**
 * Predict the Zodiac module address using CREATE2
 */
function predictZodiacModAddress(mastercopy: string, encodedSetUp: string): Address {
  const factory = MODULE_PROXY_FACTORY.toLowerCase() as Address;
  const saltNonce = "0x0000000000000000000000000000000000000000000000000000000000000000";

  // Create the proxy bytecode (minimal proxy pattern)
  const mastercopyClean = mastercopy.toLowerCase().replace(/^0x/, "");
  const bytecode = PROXY_BYTECODE_PREFIX + mastercopyClean + PROXY_BYTECODE_SUFFIX;

  // Calculate salt: solidityPackedKeccak256(solidityPackedKeccak256(["bytes"], [encodedSetUp]), saltNonce)
  // This matches account-kit's _predictZodiacModAddress implementation
  const setUpHash = keccak256(encodePacked(["bytes"], [encodedSetUp as `0x${string}`]));
  const salt = keccak256(encodePacked(["bytes32", "uint256"], [setUpHash, BigInt(saltNonce)]));

  // Calculate CREATE2 address
  const bytecodeHash = keccak256(bytecode as `0x${string}`);
  return getCreate2Address({
    from: factory,
    salt: salt as `0x${string}`,
    bytecodeHash: bytecodeHash as `0x${string}`,
  });
}

/**
 * Predict the delay module address for a given Safe address
 * This replicates the functionality of @gnosispay/account-kit's predictAddresses().delay
 */
export function predictDelayModAddress(account: string): Address {
  const normalizedAccount = getAddress(account);
  const encodedSetUp = encodeDelayModSetUp(normalizedAccount);
  return predictZodiacModAddress(DELAY_MOD_MASTERCOPY.toLowerCase(), encodedSetUp);
}
