const dotenv = require("dotenv");
const fs = require("node:fs");
const path = require("node:path");
const process = require("node:process");
const meilisearch = require("meilisearch");
const resetMeilisearch = require("../src/utils/scripts/resetMeilisearch").resetMeilisearch

const exit = process.exit;
const envFilePath = path.resolve(__dirname, "..", ".env.dev");
console.log(`Reading .env file '${envFilePath}'`);

async function readEnvFile() {
    return new Promise((resolve, reject) => {
        const envFileReadStream = fs.createReadStream(envFilePath);
        const buffer = [];

        envFileReadStream.on("data", (chunk) => buffer.push(chunk));
        envFileReadStream.on("end", () => resolve(buffer));
        envFileReadStream.on("error", (error) => reject(error));
    });
}

readEnvFile().then(async (buffer) => {
    console.log("Connecting to meilisearch...");

    const env = dotenv.parse(buffer);

    const host = env.MEILISEARCH_HOST;
    const port = env.MEILISEARCH_PORT ? parseInt(env.MEILISEARCH_PORT) : null;
    const apiKey = env.MEILISEARCH_KEY;

    const meiliClient = new meilisearch.MeiliSearch({
        host: `${host}:${port ?? 7700}`,
        headers: {
            "Authorization": `Bearer ${apiKey}`
        }
    });

    return resetMeilisearch(meiliClient);
}).then(() => {
    exit(0);
}).catch((error) => {
    console.error(error);
    exit(1);
});