import z from "zod";

const environmentSchema = z.object({
  SERVER_HOST: z.url(),
  SERVER_PORT: z.coerce.number().int().positive(),
});

const config = environmentSchema.parse(process.env);

export default config;
