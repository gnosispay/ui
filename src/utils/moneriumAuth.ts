/**
 * Utility functions for Monerium authentication flow
 * Implements PKCE (Proof Key for Code Exchange) and SIWE message generation
 */

/**
 * Generates a cryptographically secure random string for PKCE code_verifier
 * Must be between 43 and 128 characters as per RFC 7636
 */
// export const generateCodeVerifier = (): string => {
//   const array = new Uint8Array(32);
//   crypto.getRandomValues(array);
//   return btoa(String.fromCharCode.apply(null, Array.from(array)))
//     .replace(/\+/g, "-")
//     .replace(/\//g, "_")
//     .replace(/=/g, "");
// };

// /**
//  * Generates code_challenge from code_verifier using SHA256 and base64url encoding
//  * Follows RFC 7636 specification: base64urlEncode(SHA256(ASCII(code_verifier)))
//  */
// export const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
//   const encoder = new TextEncoder();
//   const data = encoder.encode(codeVerifier);
//   const digest = await crypto.subtle.digest("SHA-256", data);

//   return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
//     .replace(/\+/g, "-")
//     .replace(/\//g, "_")
//     .replace(/=/g, "");
// };

/**
 * Generates a random nonce for SIWE message
 */
// export const generateNonce = (): string => {
//   const array = new Uint8Array(16);
//   crypto.getRandomValues(array);
//   return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
// };

// /**
//  * Creates a SIWE message for Monerium authentication
//  */
// export const createMoneriumSiweMessage = (address: string, nonce: string): string => {
//   const now = new Date();
//   const expirationTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

//   return `localhost:5173 wants you to sign in with your Ethereum account:
// ${address}

// Allow Gnosis Pay - Sandbox to access my data on Monerium

// URI: http://localhost:5173
// Version: 1
// Chain ID: 1
// Nonce: ${nonce}
// Issued At: ${now.toISOString()}
// Expiration Time: ${expirationTime.toISOString()}
// Resources:
// - https://gnosispay.com`;
// };

/**
 * Sends the authentication request to Monerium API
 */
export const sendMoneriumAuthRequest = async ({
  clientId,
  codeChallenge,
  signature,
  message,
}: {
  clientId: string;
  codeChallenge: string;
  signature: string;
  message: string;
}): Promise<Response> => {
  const formData = new URLSearchParams({
    client_id: clientId,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    redirect_uri: "http://localhost:5173",
    authentication_method: "siwe",
    signature,
    message,
  });

  return fetch("https://api.monerium.app/auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  });
};

const CODE_CHALLENGE_LOCAL_STORAGE_KEY = "gp-ui.code-challenge";

export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(digest));

  // Convert hash bytes to base64 string
  const base64 = btoa(String.fromCharCode(...hashArray));

  // Convert to base64url format (no padding, + to -, / to _)
  const result = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  localStorage.setItem(CODE_CHALLENGE_LOCAL_STORAGE_KEY, result);
  return result;
}

export function getCodeChallenge(): string {
  return localStorage.getItem(CODE_CHALLENGE_LOCAL_STORAGE_KEY) || "";
}

export function generateCodeVerifier(length = 64): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let result = "";
  const values = new Uint8Array(length);
  crypto.getRandomValues(values);
  for (let i = 0; i < values.length; i++) {
    result += charset[values[i] % charset.length];
  }
  return result;
}

export function generateState(length = 16) {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
