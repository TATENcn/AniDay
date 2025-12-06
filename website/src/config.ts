interface IConfig {
	serverHost: string;
	serverPort: number;
}

export default {
	serverHost: "http://localhost",
	serverPort: 3000,
} satisfies IConfig;
