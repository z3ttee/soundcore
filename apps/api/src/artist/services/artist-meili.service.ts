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

    public async fetchDueEntities(pageable: Pageable): Promise<Page<Artist>> {
        return this.repository.createQueryBuilder("artist")
            .leftJoin("artist.artwork", "artwork").addSelect(["artwork.id"])
            .where("artist.meilisearchFlag = :syncFlag", { syncFlag: MeilisearchFlag.NEVER })
            .limit(pageable.limit)
            .offset(pageable.offset)
            .getManyAndCount().then(([entities, total]) => {
                return Page.of(entities, total, pageable.offset);
            });
    }

    public async syncEntities(entities: Partial<Artist>[]) {
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

    public async updateMeilisearchInfos(entities: Partial<Artist>[], flag: MeilisearchFlag) {
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