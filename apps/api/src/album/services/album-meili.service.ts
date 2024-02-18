import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Page, Pageable } from "@soundcore/common";
import { InjectIndex, MeiliIndex } from "@soundcore/meilisearch";
import { Repository } from "typeorm";
import { MeilisearchBaseService } from "../../meilisearch/services/meili.service";
import { MeilisearchFlag } from "../../utils/entities/meilisearch.entity";
import { Album } from "../entities/album.entity";

@Injectable()
export class AlbumMeiliService extends MeilisearchBaseService<Album> {

    constructor(
        @InjectIndex(Album) index: MeiliIndex<Album>,
        @InjectRepository(Album) repository: Repository<Album>
    ) {
        super(index, repository, new Logger(AlbumMeiliService.name));
    }

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
                return Page.of(entities, total, pageable);
            });
    }

}