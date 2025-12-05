import { Elysia } from "elysia";
import config from "./config";

const app = new Elysia().listen(config.SERVER_PORT);

export { app };
export type App = typeof app;
