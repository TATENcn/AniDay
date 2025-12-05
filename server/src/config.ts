import { t } from "elysia";

const schema = t.Object({
  SERVER_PORT: t.Numeric(),
  SERVER_HOST: t.String(),
});

export type Schema = typeof schema.static;
export default schema.parse(process.env);
