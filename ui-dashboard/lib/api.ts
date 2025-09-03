import getURL from "@/lib/get-url";
import type { cookies as nextCookies } from "next/headers";

export class ApiError extends Error {
  override cause?: any;
  httpStatusCode?: number;
  externalApiCallStatusCode?: number;

  constructor(
    message: string,
    cause?: any,
    httpStatusCode?: number,
    externalApiCallStatusCode?: number,
  ) {
    super(message);
    this.cause = cause;
    this.httpStatusCode = httpStatusCode;
    this.externalApiCallStatusCode = externalApiCallStatusCode;
  }
}

/**
 * @deprecated This function will be deprecated in the future versions.
 * This function had the downsides of looking like a fetch call while not being one.
 * We recommend using the utils below instead.
 */
const api = (cookies?: () => ReturnType<typeof nextCookies> | undefined) => {
  let jwt;

  if (cookies !== undefined) {
    jwt = cookies()?.get("jwt")?.value;
  }

  const headers = {
    "Content-Type": "application/json",
    ...(jwt && { Authorization: `Bearer ${jwt}` }),
  };

  const call = async (method: string, url: string, body?: any) => {
    return await fetch(`${getURL()}api/v1${url}`, {
      method,
      headers,
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  };

  return {
    get: (url: string) => call("GET", url),
    post: (url: string, body: any) => call("POST", url, body),
    patch: (url: string, body: any) => call("PATCH", url, body),
  };
};
export default api;

/**
 * Status: Hold (proceed with caution/experimental)
 */
export const getJwt = (
  cookies?: () => ReturnType<typeof nextCookies> | undefined,
) => {
  if (cookies !== undefined) {
    return cookies()?.get("jwt")?.value;
  }
};

/**
 * Status: Hold (proceed with caution/experimental)
 */
export const getHeaders = (jwt?: string) => ({
  "Content-Type": "application/json",
  ...(jwt && { Authorization: `Bearer ${jwt}` }),
});
/**
 * Status: Hold (proceed with caution/experimental)
 */

export const getBaseURL = () => {
  return `${getURL()}api/v1`;
};

/**
 * Status: Hold (proceed with caution/experimental)
 */
export const getBaseParams = (
  cookies?: () => ReturnType<typeof nextCookies> | undefined,
) => ({
  headers: getHeaders(getJwt(cookies)),
  credentials: "include" as RequestCredentials,
});

type FetchApiProps = {
  method?: string;
  body?: Record<string | number, unknown> | Array<unknown> | string;
  headers?: Record<string, string>;
  cookies?: () => ReturnType<typeof nextCookies>;
};

export const fetchApi = async <T = any>(
  url: string,
  { method = "GET", body, headers, cookies }: FetchApiProps | undefined = {},
): Promise<{
  response: Response;
  data: T | null;
}> => {
  const response = await fetch(`${getBaseURL()}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader({ cookies }),
      ...headers,
    },
    cache: "no-store",
    credentials: "include",
    body: JSON.stringify(body),
  });

  const responseData = await response.json();

  if (!response.ok) {
    if (responseData.errors) {
      throw new ApiError(
        responseData.message || "Request failed",
        responseData.errors,
        response.status,
        responseData?.errors?.externalApiCallStatusCode,
      );
    }

    if (responseData.error) {
      throw new ApiError(responseData.error);
    }

    if (responseData.message) {
      throw new ApiError(responseData.message);
    }

    return { response, data: null };
  }

  return { response, data: responseData };
};

const getAuthHeader = ({
  cookies,
}: {
  cookies?: () => ReturnType<typeof nextCookies>;
}): {
  Cookie?: string;
  Authorization?: string;
} => {
  const authJsSecureCookie = cookies?.()?.get(
    "__Secure-authjs.session-token",
  )?.value;

  if (authJsSecureCookie) {
    return {
      Cookie: `__Secure-authjs.session-token=${authJsSecureCookie}`,
    };
  }

  const authJsCookie = cookies?.()?.get("authjs.session-token")?.value;
  if (authJsCookie) {
    return {
      Cookie: `authjs.session-token=${authJsCookie}`,
    };
  }

  const authorizationToken = cookies?.()?.get("jwt")?.value;
  if (authorizationToken) {
    return {
      Authorization: `Bearer ${authorizationToken}`,
    };
  }

  return {};
};

export const getAPISession = async (cookies?: typeof nextCookies) => {
  try {
    const { data } = await fetchApi("/auth/session", { cookies });
    return data;
  } catch (e) {
    return null;
  }
};

export const getCardPublicKey = async (cardId: string): Promise<string> => {
  const { data } = await fetchApi(`/cards/${cardId}/public-key`);
  return data.publicKey;
};

export const getFutureCardPublicKey = async (): Promise<string> => {
  const { data } = await fetchApi(`/user/card-public-key`);
  return data.publicKey;
};
