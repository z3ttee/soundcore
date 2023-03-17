const dotenv = require("dotenv");
const fs = require("node:fs");
const path = require("node:path");
const process = require("node:process");
const typeorm = require("typeorm");
const resetDatabase = require("../src/utils/scripts/resetDatabase").resetDatabase

const exit = process.exit;
const DataSource = typeorm.DataSource;

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

readEnvFile().then((buffer) => {
    const env = dotenv.parse(buffer);
    console.log("Connecting to database...");

    const ds = new DataSource({
        type: "mariadb",
        host: env.DB_HOST,
        port: Number(env.DB_PORT),
        username: env.DB_USER,
        password: env.DB_PASS,
        entityPrefix: env.DB_PREFIX,
        database: env.DB_NAME
    });

    return ds.initialize().then((datasource) => {
        console.log("Successfully connected to database");
        return resetDatabase(datasource);
    });
}).then(() => {
    exit(0);
}).catch((error) => {
    console.error(error);
    exit(1);
});
