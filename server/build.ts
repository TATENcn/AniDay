Bun.build({
	entrypoints: ["src/index.ts"],
	outdir: "../dist-server",
	tsconfig: "./tsconfig.json",
	packages: "bundle",
	publicPath: "../public",
	compile: true,
	minify: true,
});
