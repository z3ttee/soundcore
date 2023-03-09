import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { InjectIndex, MeiliIndex } from "@soundcore/meilisearch";
import { Page, Pageable } from "nestjs-pager";
import { Repository } from "typeorm";
import { MeilisearchFlag } from "../../utils/entities/meilisearch.entity";
import { Artist, ArtistIndex } from "../entities/artist.entity";

@Injectable()
export class ArtistMeiliService {
    private readonly logger = new Logger(ArtistMeiliService.name);

    constructor(
        @InjectIndex(ArtistIndex) private readonly index: MeiliIndex<ArtistIndex>,
        @InjectRepository(Artist) private readonly repository: Repository<Artist>
    ) {}

    /**
     * Fetch entities from the database to sync. This will only fetch entities
     * that have a flag with NEVER.
     * @param pageable Page settings
     * @param flag Flag used to fetch entities
     * @returns Page
     */
    public async fetchEntities(pageable: Pageable, flag: MeilisearchFlag = MeilisearchFlag.NEVER): Promise<Page<Artist>> {
        return this.repository.createQueryBuilder("artist")
            .leftJoin("artist.artwork", "artwork").addSelect(["artwork.id"])
            .where("artist.meilisearchFlag = :syncFlag", { syncFlag: flag })
            .limit(pageable.limit)
            .offset(pageable.offset)
            .getManyAndCount().then(([entities, total]) => {
                return Page.of(entities, total, pageable.offset);
            });
    }

    /**
     * Sync a set of entities with meilisearch. After sync is done, the entities are
     * updated with a flag and date of the last sync result.
     * @param entities Set of entities to sync
     */
    public async syncAndUpdateEntities(entities: Partial<Artist>[]) {
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

    private async updateMeilisearchInfos(entities: Partial<Artist>[], flag: MeilisearchFlag) {
        return this.repository.createQueryBuilder()
            .update()
            .set({
                meilisearch: {
                    flag: flag,
                    syncedAt: new Date()
                }
            })
            .whereInIds(entities)
            .execute();
    }

}