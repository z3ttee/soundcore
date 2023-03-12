import { Injectable, Logger } from "@nestjs/common";
import { MeiliIndex } from "@soundcore/meilisearch";
import { Page, Pageable } from "nestjs-pager";
import { Repository } from "typeorm";
import { MeilisearchFlag } from "../../utils/entities/meilisearch.entity";
import { MeiliBackgroundService } from "./meili-background.service";

@Injectable()
export class MeilisearchService {

    constructor(
        private readonly background: MeiliBackgroundService
    ) {}

}

export abstract class MeilisearchBaseService<T = any> {

    constructor(
        protected readonly index: MeiliIndex<T>,
        protected readonly repository: Repository<T>,
        protected readonly logger: Logger
    ) {}

    /**
     * Get index used for operations 
     * on meilisearch instance
     */
    public getIndex() {
        return this.index;
    }

    /**
     * Sync a set of entities with meilisearch. After sync is done, the entities are
     * updated with a flag and date of the last sync result.
     * @param entities Set of entities to sync
     */
    public async syncAndUpdateEntities(entities: Partial<T>[]) {
        let flag: MeilisearchFlag = MeilisearchFlag.OK;

        await this.index.updateDocuments(entities).then(async (enqeuedTask) => {
            return this.index.waitForTask(enqeuedTask.taskUid).then((task) => {
                if(task.error) {
                    throw new Error(`(${task.error.code}) Error occured while updating documents: ${task.error.message}. See '${task.error.link}' for more information`);
                }
            })
        }).then(() => {
            flag = MeilisearchFlag.OK;
        }).catch((error: Error) => {
            this.logger.error(error);
            flag = MeilisearchFlag.FAILED;
        });

        return this.updateMeilisearchInfos(entities, flag);
    }

    /**
     * Update meilisearch information on a database entity
     * @param entities List of entities to update information for
     * @param flag Flag to set
     */
    protected async updateMeilisearchInfos(entities: Partial<T>[], flag: MeilisearchFlag) {
        return this.repository.createQueryBuilder()
            .update()
            .set({
                meilisearch: {
                    flag: flag,
                    syncedAt: new Date()
                }
            } as any)
            .whereInIds(entities)
            .execute();
    }

    protected abstract fetchEntities(pageable: Pageable, flag: MeilisearchFlag): Promise<Page<T>>;
}