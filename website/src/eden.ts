import { treaty } from "@elysiajs/eden";
import type { App } from "server";
import config from "./config";

export default treaty<App>(`${config.SERVER_HOST}:${config.SERVER_PORT}`);
