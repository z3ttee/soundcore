import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Page, Pageable } from "@soundcore/common";
import { Repository } from "typeorm";
import { Playlist } from "../../playlist/entities/playlist.entity";
import { User } from "../../user/entities/user.entity";
import { LikedResource } from "../entities/like.entity";
import { PlaylistService } from "../../playlist/services/playlist.service";

@Injectable()
export class LibraryService {

    constructor(
        private readonly playlistService: PlaylistService,
        @InjectRepository(LikedResource) private readonly repository: Repository<LikedResource>
    ) {}

    public async findPageByUser(user: User, pageable: Pageable): Promise<Page<LikedResource | Playlist>> {
        return this.repository.createQueryBuilder("like")
            .leftJoin("like.user", "user")
            .leftJoinAndSelect("like.song", "song")
            .leftJoinAndSelect("like.playlist", "playlist")
            .leftJoinAndSelect("like.album", "album")
            .offset(pageable.offset)
            .limit(pageable.limit)
            .where("user.id = :userId", { userId: user.id })
            .getManyAndCount().then(([resources, total]) => {
                return Page.of(resources, total, pageable);
            });
    }

}