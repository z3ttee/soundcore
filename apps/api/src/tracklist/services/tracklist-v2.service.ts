import { Injectable } from '@nestjs/common';
import { TracklistV2 } from '../entities/tracklist.entity';
import { SongService } from '../../song/services/song.service';
import { User } from '../../user/entities/user.entity';
import { Pageable, randomInt } from '@soundcore/common';
import { PlayableEntityType } from '../entities/playable.entity';

@Injectable()
export class TracklistV2Service {

    constructor(
        private readonly songService: SongService,
    ) {}

    public async findTracklistByAlbumId(albumId: string, pageable: Pageable, authentication?: User, shuffled?: boolean): Promise<TracklistV2> {
        const seed = shuffled ? randomInt(8) : undefined;
        return this.songService.findByAlbum(albumId, pageable, authentication, seed).then((page) => {
            return new TracklistV2(albumId, PlayableEntityType.ALBUM, page.totalSize, page, seed ?? undefined);
        });
    }

    public async findTracklistByArtistId(artistId: string, pageable: Pageable, authentication?: User, shuffled?: boolean): Promise<TracklistV2> {
        const seed = shuffled ? randomInt(8) : undefined;
        return this.songService.findByArtist(artistId, pageable, authentication, seed).then((page) => {
            return new TracklistV2(artistId, PlayableEntityType.ARTIST, page.totalSize, page, seed ?? undefined);
        });
    }

}
