import { Elysia } from "elysia";

const app = new Elysia();

export { app };
export type App = typeof app;
