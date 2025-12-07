import { treaty } from "@elysiajs/eden";
import type { App } from "server";
import config from "./config";

export default treaty<App>(config.VITE_API_BASE_URL);
