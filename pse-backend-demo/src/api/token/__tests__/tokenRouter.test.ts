import { StatusCodes } from "http-status-codes";
import request from "supertest";

import type { ServiceResponse } from "@/common/models/serviceResponse";
import { app } from "@/server";

describe("Token API endpoints", () => {
	it.skip("GET / - success", async () => {
		const response = await request(app).get("/token");
		const result: ServiceResponse = response.body;

		expect(response.statusCode).toEqual(StatusCodes.OK);
		expect(result.success).toBeTruthy();
		expect(result.responseObject).toBeDefined;
		expect(result.message).toEqual("Success");
	});
});
