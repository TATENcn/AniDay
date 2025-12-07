import z from "zod";

const configSchema = z.object({
	VITE_API_BASE_URL: z.string(),
});

export default configSchema.parse(import.meta.env);
