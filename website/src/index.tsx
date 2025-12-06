import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { createRoot } from "react-dom/client";
import "@/assets/global.css";
import router from "./router";

// biome-ignore lint/style/noNonNullAssertion: index.html 拥有 #root 元素
const element = document.querySelector("#app")!;

const queryClient = new QueryClient();

const root = createRoot(element);
root.render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>
);
