import { t } from "elysia";
import { compile } from "elysia/type-system/utils";

const schema = t.Object({
  SERVER_PORT: t.Numeric(),
  SERVER_HOST: t.String(),
});

export type Schema = typeof schema.static;
export default compile(schema).Decode(process.env);
