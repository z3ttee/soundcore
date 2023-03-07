import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { InjectIndex, MeiliIndex } from "@soundcore/meilisearch";
import { Page, Pageable } from "nestjs-pager";
import { Repository } from "typeorm";
import { MeilisearchFlag } from "../../utils/entities/meilisearch.entity";
import { Album, AlbumIndex } from "../entities/album.entity";

@Injectable()
export class AlbumMeiliService {
    private readonly logger = new Logger(AlbumMeiliService.name);

    constructor(
        @InjectIndex(AlbumIndex) private readonly index: MeiliIndex<AlbumIndex>,
        @InjectRepository(Album) private readonly repository: Repository<Album>
    ) {}

    /**
     * Fetch entities from the database to sync. This will only fetch entities
     * that have a flag with NEVER.
     * @param pageable Page settings
     * @param flag Flag used to fetch entities
     * @returns Page
     */
    public async fetchEntities(pageable: Pageable, flag: MeilisearchFlag = MeilisearchFlag.NEVER): Promise<Page<Album>> {
        return this.repository.createQueryBuilder("album")
            .leftJoin("album.artwork", "artwork").addSelect(["artwork.id"])
            .leftJoin("album.primaryArtist", "primaryArtist").addSelect(["primaryArtist.id", "primaryArtist.slug", "primaryArtist.name"])
            .where("album.meilisearchFlag = :syncFlag", { syncFlag: flag })
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
    public async syncAndUpdateEntities(entities: Partial<Album>[]) {
        let flag: MeilisearchFlag = MeilisearchFlag.OK;

        await this.index.updateDocuments(entities).then(async (task) => {
            return this.index.waitForTask(task.taskUid)
        }).then(() => {
            flag = MeilisearchFlag.OK;
        }).catch((error: Error) => {
            this.logger.error(error);
            flag = MeilisearchFlag.FAILED;
        });

        return this.updateMeilisearchInfos(entities, flag);
    }

    private async updateMeilisearchInfos(entities: Partial<Album>[], flag: MeilisearchFlag) {
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