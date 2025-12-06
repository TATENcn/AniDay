import { TanStackDevtools, type TanStackDevtoolsReactPlugin } from "@tanstack/react-devtools";
import { Outlet, createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import IndexPage from "./pages";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";

const devtoolsPlugins: TanStackDevtoolsReactPlugin[] = [
	{
		name: "Tanstack Router",
		render: <TanStackRouterDevtoolsPanel />,
	},
	{
		name: "Tanstack Query",
		render: <ReactQueryDevtoolsPanel />,
	},
];

const root = () => {
	return (
		<>
			<Outlet />
			<TanStackDevtools plugins={devtoolsPlugins} />
		</>
	);
};

const rootRoute = createRootRoute({ component: root });

const indexRoute = createRoute({
	path: "/",
	getParentRoute: () => rootRoute,
	component: IndexPage,
});

const routesTree = rootRoute.addChildren([indexRoute]);

const router = createRouter({ routeTree: routesTree });

export default router;
