import { Injectable } from '@nestjs/common';
import { TracklistTypeV2, TracklistV2 } from '../entities/tracklist.entity';
import { SongService } from '../../song/services/song.service';
import { User } from '../../user/entities/user.entity';
import { Pageable, randomInt, randomString } from '@soundcore/common';

@Injectable()
export class TracklistV2Service {

    constructor(
        private readonly songService: SongService,
    ) {}

    public async findTracklistByAlbumId(albumId: string, authentication?: User, shuffled?: boolean): Promise<TracklistV2> {
        const seed = shuffled ? randomInt(8) : undefined;

        return this.songService.findByAlbum(albumId, new Pageable(0, 30), authentication, seed).then((page) => {
            const type = TracklistTypeV2.ALBUM;
            return new TracklistV2(albumId, TracklistV2.resolveUri(albumId, type), type, page.totalSize, page, seed ?? undefined);
        });
    }

}
