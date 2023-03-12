const dotenv = require("dotenv");
const fs = require("node:fs");
const path = require("node:path");
const process = require("node:process");
const typeorm = require("typeorm");

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

        return datasource.query("SHOW TABLES WHERE Tables_in_soundcore NOT LIKE '%zone%' AND Tables_in_soundcore NOT LIKE '%mount%';").then(async (result) => {
            const tables = result.map((entry) => Object.values(entry)[0]);

            if(tables.length <= 0) {
                console.log("No tables deleted");
                return;
            }

            console.log(`Dropping ${tables.length} tables...`);

            const sql = "DROP TABLE " + tables.join(", ") + ";";
            await datasource.query("SET foreign_key_checks = 0;");
            await datasource.query(sql);
            await datasource.query("SET foreign_key_checks = 1;");
        });
    });
}).then(() => {
    exit(0);
}).catch((error) => {
    console.error(error);
    exit(1);
});
