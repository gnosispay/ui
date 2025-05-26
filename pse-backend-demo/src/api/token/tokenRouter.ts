import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { tokenController } from "./tokenController";
import { TokenSchema } from "./tokenModel";

export const tokenRegistry = new OpenAPIRegistry();
export const tokenRouter: Router = express.Router();

tokenRegistry.registerPath({
	method: "get",
	path: "/token",
	tags: ["Token"],
	responses: createApiResponse(TokenSchema, "Success"),
});

tokenRouter.get("/", tokenController.getToken);
