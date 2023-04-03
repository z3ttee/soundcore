import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Page, Pageable } from "@soundcore/common";
import { InjectIndex, MeiliIndex } from "@soundcore/meilisearch";
import { Repository } from "typeorm";
import { MeilisearchBaseService } from "../../meilisearch/services/meili.service";
import { MeilisearchFlag } from "../../utils/entities/meilisearch.entity";
import { Playlist } from "../entities/playlist.entity";

@Injectable()
export class PlaylistMeiliService extends MeilisearchBaseService<Playlist> {

    constructor(
        @InjectIndex(Playlist) index: MeiliIndex<Playlist>,
        @InjectRepository(Playlist) repository: Repository<Playlist>
    ) {
        super(index, repository, new Logger(PlaylistMeiliService.name));
    }

    /**
     * Fetch entities from the database to sync. This will only fetch entities
     * that have a flag with NEVER.
     * @param pageable Page settings
     * @param flag Flag used to fetch entities
     * @returns Page
     */
    public async fetchEntities(pageable: Pageable, flag: MeilisearchFlag = MeilisearchFlag.NEVER): Promise<Page<Playlist>> {
        return this.repository.createQueryBuilder("playlist")
            .leftJoin("playlist.artwork", "artwork").addSelect(["artwork.id"])
            .leftJoin("playlist.author", "author").addSelect(["author.id", "author.slug", "author.name"])
            .where("playlist.meilisearchFlag = :syncFlag", { syncFlag: flag })
            .limit(pageable.limit)
            .offset(pageable.offset)
            .getManyAndCount().then(([entities, total]) => {
                return Page.of(entities, total, pageable);
            });
    }

}