import { Elysia } from "elysia";
import openapi, { fromTypes } from "@elysiajs/openapi";
import { route as charactersRoute } from "./routes/characters";
import config from "./config";
import { staticPlugin } from "@elysiajs/static";

const app = new Elysia()
  .use(
    staticPlugin({ assets: "./public", prefix: "/public", alwaysStatic: true }),
  )
  .use(openapi({ references: fromTypes() }))
  .group("/api/characters", (app) => app.use(charactersRoute))
  .listen(config.SERVER_PORT);

export { app };
export type App = typeof app;
export type { ICharacterResponse } from "./routes/characters";
