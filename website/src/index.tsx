import { createRoot } from "react-dom/client";
import IndexPage from "./pages";

// biome-ignore lint/style/noNonNullAssertion: index.html 拥有 #root 元素
const element = document.querySelector("#app")!;

const root = createRoot(element);
root.render(<IndexPage />);
