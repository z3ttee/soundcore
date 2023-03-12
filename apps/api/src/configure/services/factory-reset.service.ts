import { Injectable, Logger } from "@nestjs/common";
import { Bootstrapper } from "@soundcore/bootstrap";
import Database from "../../utils/database/database-worker-client";
import MeilisearchClient from "../../utils/database/meilisearch-worker-client";

const resetDatabase = require("../../utils/scripts/resetDatabase.js").resetDatabase;
const resetMeilisearch = require("../../utils/scripts/resetMeilisearch.js").resetMeilisearch;

@Injectable()
export class FactoryResetService {
    private readonly logger = new Logger(FactoryResetService.name);

    public async resetDatabase(exitOnCompletion: boolean = true): Promise<boolean> {
        return Database.connect().then((datasource) => {
            return resetDatabase(datasource).then(() => {
                this.logger.log(`Database has been reset to factory settings`);
            }).catch((error: Error) => {
                this.logger.error(`Failed resetting database: ${error.message}`, error.stack);
                throw error;
            });
        }).finally(() => {
            if(exitOnCompletion) this.shutdownApplication();
        });
    }

    public async resetMeilisearch(exitOnCompletion: boolean = true): Promise<boolean> {
        return MeilisearchClient.connect().then((meilisearch) => {
            return resetMeilisearch(meilisearch).then(() => {
                this.logger.log(`Search engine has been reset to factory settings`);
            }).catch((error: Error) => {
                this.logger.error(`Failed resetting search engine: ${error.message}`, error.stack);
                throw error;
            });
        }).then(() => {
            return true;
        }).finally(() => {
            if(exitOnCompletion) this.shutdownApplication();
        });
    }

    public async resetAll(exitOnCompletion: boolean = true) {
        const resettedAll = await this.resetDatabase(false) && await this.resetMeilisearch(false);
        if(exitOnCompletion) this.shutdownApplication();
        return resettedAll;
    }

    private async shutdownApplication() {
        setTimeout(() => Bootstrapper.shutdown(), 1000)
    }

}