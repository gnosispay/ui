// String to ArrayBuffer
const str2ab = (str: string) => {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
};

// ArrayBuffer to String
const ab2str = (ab: ArrayBuffer) => {
  return String.fromCharCode.apply(null, Array.from(new Uint8Array(ab)));
};

// Import a raw base64 encoded AES key
const importKey = async (rawKey: string): Promise<CryptoKey> => {
  return await window.crypto.subtle.importKey(
    "raw",
    str2ab(atob(rawKey)),
    "AES-GCM",
    false,
    ["encrypt", "decrypt"],
  );
};

// Encrypt & decrypt utils for secrets (PAN, PIN, ...)
export const encryptSecret = async (
  msg: string,
  rawKey: string,
  iv: string,
): Promise<string> => {
  const data = new TextEncoder().encode(msg);
  const key = await importKey(rawKey);
  const secret = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: str2ab(atob(iv)) },
    key,
    data,
  );
  return btoa(ab2str(secret));
};

// Session key generation and encryption
export const generateSessionKey = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, Array.from(array)));
};

export const encryptSessionKey = async (
  sessionKey: string,
  publicKey: string,
): Promise<string> => {
  const publicKeyData = str2ab(atob(publicKey));

  const cryptoKey = await window.crypto.subtle.importKey(
    "spki",
    publicKeyData,
    { name: "RSA-OAEP", hash: { name: "SHA-1" } },
    true,
    ["encrypt"],
  );
  const textEncoder = new TextEncoder();
  const sessionKeyBytes = textEncoder.encode(sessionKey);
  const encryptedKey = await window.crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    cryptoKey,
    sessionKeyBytes,
  );
  return btoa(ab2str(encryptedKey));
};

// IV generation
const CHARACTER_LIST =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
export const generateIV = (): string =>
  Array.from({ length: 16 }, () =>
    CHARACTER_LIST.charAt(Math.floor(Math.random() * CHARACTER_LIST.length)),
  ).join("");

