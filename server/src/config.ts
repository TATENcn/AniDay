import { t } from "elysia";
import { compile } from "elysia/type-system/utils";

const schema = t.Object({
	SERVER_PORT: t.Numeric({ default: 3000 }),
	SERVER_HOST: t.String({ default: "0.0.0.0" }),
});

export type Schema = typeof schema.static;
export default compile(schema).Decode(process.env);
