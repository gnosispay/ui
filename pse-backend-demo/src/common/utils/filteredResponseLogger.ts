import type { AxiosResponse } from "axios";
import * as AxiosLogger from "axios-logger";

export const filteredResponseLogger = (response: AxiosResponse) => {
  // write down your request intercept.
  return AxiosLogger.responseLogger(response, {
    data: false,
  });
};
