import https from "node:https";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { env } from "@/common/utils/envConfig";
import { logger } from "@/server";
import axios from "axios";
import type { Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { Token } from "./tokenModel";

class TokenController {
  public getToken: RequestHandler = async (_req: Request, res: Response) => {
    let serviceResponse: ServiceResponse<Token | null>;

    axios.interceptors.request.use((x) => {
      const method = x.method?.toLowerCase();
      const methodHeader = (method && x.headers[method]) || [];

      const headers = {
        ...x.headers.common,
        ...methodHeader,
        ...x.headers,
      };

      for (const header of ["common", "get", "post", "head", "put", "patch", "delete"]) {
        delete headers[header];
      }

      const printable = `${new Date()} | Request: ${x.method?.toUpperCase()} | ${x.url} | ${JSON.stringify(headers, null, 2)}`;
      console.log(printable);

      return x;
    });

    axios.interceptors.response.use((x) => {
      // only uncomment the data logging carefully, this is logging the ephemeral token
      const printable = `${new Date()} | Response: ${x.status}`; // +  `| ${JSON.stringify(x.data, null, 2)}`;

      console.log(printable);

      return x;
    });

    try {
      // Create an HTTPS agent with the certificates
      const httpsAgent = new https.Agent({
        cert: env.CLIENT_CERT,
        key: env.CLIENT_KEY,
        rejectUnauthorized: true, // Ensure SSL verification
      });

      // Make the request using axios with the custom agent
      logger.info(`Calling POST ${env.GNOSIS_PSE_PRIVATE_API_BASE_URL}/api/v1/ephemeral-token`);
      const response = await axios({
        method: "POST",
        url: `${env.GNOSIS_PSE_PRIVATE_API_BASE_URL}/api/v1/ephemeral-token`,
        headers: {
          "Content-Type": "application/json",
        },
        httpsAgent: httpsAgent,
        // Add a timeout to prevent hanging requests
        timeout: 10000,
      });

      serviceResponse = ServiceResponse.success("Success", response.data);
    } catch (error) {
      console.log("=== Error:", error);

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
