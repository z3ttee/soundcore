import { Logger } from "@nestjs/common";
import { DataSource, DataSourceOptions } from "typeorm";
import { DbInitFn } from "../types";

export async function executeDbInit(dbOptions: DataSourceOptions, dbInitFn: DbInitFn, logger: Logger): Promise<void> {
  const datasource = new DataSource(dbOptions);

  logger.log("Starting database initialization");
  const startedAt = Date.now();
  return datasource
    .initialize()
    .then(async (ds) => {
      return ds.transaction(dbInitFn);
    })
    .then((res) => {
      const endedAt = Date.now();
      logger.log(`Database initialization took ${endedAt - startedAt}ms`);
      return res;
    })
    .catch((err: Error) => {
      logger.error(`Error initializing database: ${err.message}`, err.stack);
      throw err;
    })
    .finally(() => {
      if (datasource.isInitialized) {
        datasource.destroy();
      }
    });
}
