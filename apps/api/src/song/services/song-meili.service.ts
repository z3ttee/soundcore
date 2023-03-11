import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { InjectIndex, MeiliIndex } from "@soundcore/meilisearch";
import { Page, Pageable } from "nestjs-pager";
import { Repository } from "typeorm";
import { MeilisearchFlag } from "../../utils/entities/meilisearch.entity";
import { Song } from "../entities/song.entity";

@Injectable()
export class SongMeiliService {
    private readonly logger = new Logger(SongMeiliService.name);

    constructor(
        @InjectIndex(Song) private readonly index: MeiliIndex<Song>,
        @InjectRepository(Song) private readonly repository: Repository<Song>
    ) {}

    /**
     * Fetch entities from the database to sync. This will only fetch entities
     * that have a flag with NEVER.
     * @param pageable Page settings
     * @param flag Flag used to fetch entities
     * @returns Page
     */
    public async fetchEntities(pageable: Pageable, flag: MeilisearchFlag = MeilisearchFlag.NEVER): Promise<Page<Song>> {
        return this.repository.createQueryBuilder("song")
            .leftJoin("song.artwork", "artwork").addSelect(["artwork.id"])
            .leftJoin("song.primaryArtist", "primaryArtist").addSelect(["primaryArtist.id", "primaryArtist.slug", "primaryArtist.name"])
            .leftJoin("song.featuredArtists", "featuredArtists").addSelect(["featuredArtists.id", "featuredArtists.slug", "featuredArtists.name"])
            .leftJoin("song.album", "album").addSelect(["album.id", "album.slug", "album.name"])
            .where("song.meilisearchFlag = :syncFlag", { syncFlag: flag })
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
    public async syncAndUpdateEntities(entities: Partial<Song>[]) {
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

    /**
     * Get index used for operations on meilisearch instance
     */
    public getIndex() {
        return this.index;
    }

    private async updateMeilisearchInfos(entities: Partial<Song>[], flag: MeilisearchFlag) {
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