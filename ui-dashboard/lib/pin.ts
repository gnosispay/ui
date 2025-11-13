import {
  encryptSecret,
  encryptSessionKey,
  generateIV,
  generateSessionKey,
} from "@/lib/cryptography";

export const serializeToPinBlock2 = (pin: string) =>
  `2${pin.length}${pin}`.padEnd(16, "F");

export const serializeFromPinBlock2 = (pinBlock: string) =>
  pinBlock.substring(2, 2 + Number(pinBlock.charAt(1)));

export const generateEncryptedPinData = async (
  pin: string,
  publicKey: string,
) => {
  const pinBlock = serializeToPinBlock2(pin);
  const key = generateSessionKey();
  const iv = generateIV();
  const encryptedKey = await encryptSessionKey(key, publicKey);
  const encryptedPin = await encryptSecret(pinBlock, key, iv);

  return {
    encryptedPin,
    encryptedKey,
    iv,
  };
};
