"use server";

import { createHmac } from "crypto";
import { z } from "zod";

const { SUMSUB_APP_TOKEN, SUMSUB_SECRET_KEY } = process.env;
const SUMSUB_BASE_URL = "https://api.sumsub.com";

const SumsubAccessTokenResponse = z.object({
  token: z.string(),
  userId: z.string(),
});

const createSumsubAuthParams = (method: string, url: string, body?: string) => {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = createHmac("sha256", SUMSUB_SECRET_KEY!);
  const data = `${timestamp}${method.toUpperCase()}${url}`;
  signature.update(data);

  if (body) {
    signature.update(body);
  }

  return {
    signature: signature.digest("hex"),
    timestamp,
  };
};

export const getSumsubAccessToken = async (userId: string) => {
  const startLevel = "level-0-customer-country-data";
  const path = `/resources/accessTokens?userId=${userId}&levelName=${startLevel}&ttlInSecs=600`;
  const url = `${SUMSUB_BASE_URL}${path}`;
  const method = "POST";
  const { signature, timestamp } = createSumsubAuthParams(method, path);
  const response = await fetch(url, {
    method,
    headers: {
      "X-App-Token": SUMSUB_APP_TOKEN!,
      "X-App-Access-Ts": timestamp,
      "X-App-Access-Sig": signature,
    },
  });

  const body = await response.json();

  if (!response.ok) {
    console.error(body);
    return null;
  }

  const { token } = SumsubAccessTokenResponse.parse(body);
  return token;
};
