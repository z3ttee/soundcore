import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Page, Pageable } from "@soundcore/common";
import { InjectIndex, MeiliIndex } from "@soundcore/meilisearch";
import { Repository } from "typeorm";
import { MeilisearchBaseService } from "../../meilisearch/services/meili.service";
import { MeilisearchFlag } from "../../utils/entities/meilisearch.entity";
import { Artist } from "../entities/artist.entity";

@Injectable()
export class ArtistMeiliService extends MeilisearchBaseService<Artist> {

    constructor(
        @InjectIndex(Artist) index: MeiliIndex<Artist>,
        @InjectRepository(Artist) repository: Repository<Artist>
    ) {
        super(index, repository, new Logger(ArtistMeiliService.name));
    }

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
                return Page.of(entities, total, pageable);
            });
    }


}