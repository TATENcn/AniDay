import { Elysia } from "elysia";
import openapi, { fromTypes } from "@elysiajs/openapi";
import { route as charactersRoute } from "./routes/characters";
import config from "./config";

const app = new Elysia()
  .use(openapi({ references: fromTypes() }))
  .group("/api/characters", (app) => app.use(charactersRoute))
  .listen(config.SERVER_PORT);

export { app };
export type App = typeof app;
