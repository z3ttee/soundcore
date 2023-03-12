import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { InjectIndex, MeiliIndex } from "@soundcore/meilisearch";
import { Page, Pageable } from "nestjs-pager";
import { Repository } from "typeorm";
import { MeilisearchBaseService } from "../../meilisearch/services/meili.service";
import { MeilisearchFlag } from "../../utils/entities/meilisearch.entity";
import { Song } from "../entities/song.entity";

@Injectable()
export class SongMeiliService extends MeilisearchBaseService<Song> {

    constructor(
        @InjectIndex(Song) index: MeiliIndex<Song>,
        @InjectRepository(Song) repository: Repository<Song>
    ) {
        super(index, repository, new Logger(SongMeiliService.name));
    }

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

}