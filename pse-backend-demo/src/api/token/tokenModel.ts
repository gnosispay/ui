import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export type Token = z.infer<typeof TokenSchema>;
export const TokenSchema = z.object({
	data: z.object({
		token: z.string(),
		expiresAt: z.date(),
	}),
});
