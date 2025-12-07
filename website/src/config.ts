import z from "zod";

const configSchema = z.object({
	VITE_API_BASE_URL: z.string().default("http://localhost:3000"),
});

export default configSchema.parse(import.meta.env);
