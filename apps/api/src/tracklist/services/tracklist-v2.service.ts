import { Injectable } from '@nestjs/common';
import { TracklistTypeV2, TracklistV2 } from '../entities/tracklist.entity';
import { SongService } from '../../song/services/song.service';
import { User } from '../../user/entities/user.entity';
import { Pageable, randomInt } from '@soundcore/common';
import { MAX_TRACKLIST_PAGE_SIZE } from '../../constants';

@Injectable()
export class TracklistV2Service {

    constructor(
        private readonly songService: SongService,
    ) {}

    public async findTracklistByAlbumId(albumId: string, authentication?: User, shuffled?: boolean): Promise<TracklistV2> {
        const seed = shuffled ? randomInt(8) : undefined;

        return this.songService.findByAlbum(albumId, new Pageable(0, MAX_TRACKLIST_PAGE_SIZE), authentication, seed).then((page) => {
            const type = TracklistTypeV2.ALBUM;
            return new TracklistV2(albumId, TracklistV2.resolveUri(albumId, type), type, page.totalSize, page, seed ?? undefined);
        });
    }

    public async findTracklistByArtistId(artistId: string, authentication?: User, shuffled?: boolean): Promise<TracklistV2> {
        const seed = shuffled ? randomInt(8) : undefined;

        return this.songService.findByArtist(artistId, new Pageable(0, MAX_TRACKLIST_PAGE_SIZE), authentication, seed).then((page) => {
            const type = TracklistTypeV2.ARTIST;
            return new TracklistV2(artistId, TracklistV2.resolveUri(artistId, type), type, page.totalSize, page, seed ?? undefined);
        });
    }

}
