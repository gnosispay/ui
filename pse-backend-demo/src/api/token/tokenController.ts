import https from "node:https";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { env } from "@/common/utils/envConfig";
import axios from "axios";
import * as AxiosLogger from "axios-logger";

import type { Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { Token } from "./tokenModel";
import { filteredResponseLogger } from "@/common/utils/filteredResponseLogger";

class TokenController {
  public getToken: RequestHandler = async (_req: Request, res: Response) => {
    let serviceResponse: ServiceResponse<Token | null>;
    const axiosInstance = axios.create();
    axiosInstance.interceptors.request.use(AxiosLogger.requestLogger, AxiosLogger.errorLogger);
    axiosInstance.interceptors.response.use(filteredResponseLogger, AxiosLogger.errorLogger);

    // Decode the base64 encoded certificate and key from environment variables
    const cert = Buffer.from(env.CLIENT_CERT, "base64").toString("ascii");
    const key = Buffer.from(env.CLIENT_KEY, "base64").toString("ascii");

    try {
      // Create an HTTPS agent with the certificates
      const httpsAgent = new https.Agent({
        cert,
        key,
        rejectUnauthorized: true, // Ensure SSL verification
      });

      // Make the request using axios with the custom agent
      const response = await axiosInstance({
        method: "POST",
        url: `${env.GNOSIS_PSE_PRIVATE_API_BASE_URL}/api/v1/ephemeral-token`,
        headers: {
          "Content-Type": "application/json",
        },
        httpsAgent: httpsAgent,
      });

      serviceResponse = ServiceResponse.success("Success", response.data);
    } catch (error) {
      console.error(error);

      let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
      let errorMessage = "An error occurred while fetching the token.";

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          statusCode = error.response.status;
          errorMessage = `API responded with status ${statusCode}: ${error.response.data}`;
        } else if (error.request) {
          // The request was made but no response was received
          errorMessage = "No response received from API";
        } else {
          // Something happened in setting up the request
          errorMessage = error.message;
        }
      }
      serviceResponse = ServiceResponse.failure(errorMessage, null, statusCode);
    }
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };
}

export const tokenController = new TokenController();
