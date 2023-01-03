import { Injectable } from '@nestjs/common';
import { Page, Pageable } from 'nestjs-pager';
import { ArtistService } from '../../artist/artist.service';
import { Artist } from '../../artist/entities/artist.entity';
import { User } from '../../user/entities/user.entity';
import { UserService } from '../../user/user.service';

@Injectable()
export class ProfileService {

    constructor(
        private readonly userService: UserService,
        private readonly artistService: ArtistService
    ) {}

    public async findByCurrentUser(authentication: User): Promise<User> {
        return this.findByUserId(authentication.id);
    }

    public async findByUserId(userId: string): Promise<User> {
        const result = await this.userService.repository.createQueryBuilder("profile")
            .loadRelationCountAndMap("profile.playlistCount", "profile.playlists")
            .where("profile.id = :userId OR profile.slug = :userId", { userId })
            .getOne();

        return result;
    }

    public async findTopArtistsByUser(userId: string): Promise<Page<Artist>> {
        const result = await this.artistService.getRepository().createQueryBuilder("artist")
            .leftJoin("artist.artwork", "artwork").addSelect(["artwork.id"])
            .leftJoin("artist.songs", "songs")
            .leftJoin("songs.streams", "streams")
            .addSelect("COUNT(streams.id) AS streamCount")

            .orderBy("streamCount", "DESC")
            .limit(5)
            .groupBy("artist.id")

            .where("streams.listenerId = :userId", { userId })
            .getRawAndEntities();

        return Page.of(result.entities.map((artist, index) => {
            artist.streamCount = Number(result.raw[index]?.streamCount ?? 0);
            return artist;
        }), result.entities.length, 0);
    }

}
