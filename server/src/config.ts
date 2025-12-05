import { z } from "zod";

const schema = z.object({
  SERVER_PORT: z.coerce.number(),
  SERVER_HOST: z.string(),
});

export type Schema = z.infer<typeof schema>;
export default schema.parse(process.env);
