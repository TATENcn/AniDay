import config from "./config";

const characterDataUri = (characterName: string, filename: string) => {
	return `${config.SERVER_HOST}:${config.SERVER_PORT}/public/${characterName}/${filename}`;
};

export { characterDataUri };
