import { Injectable } from '@nestjs/common';
import { TracklistTypeV2, TracklistV2 } from '../entities/tracklist.entity';
import { SongService } from '../../song/services/song.service';
import { User } from '../../user/entities/user.entity';
import { Pageable } from '@soundcore/common';

@Injectable()
export class TracklistV2Service {

    constructor(
        private readonly songService: SongService,
    ) {}

    public async findTracklistByAlbumId(albumId: string, authentication?: User): Promise<TracklistV2> {
        return this.songService.findTracksByAlbum(albumId, new Pageable(0, 30), authentication).then((page) => {
            const type = TracklistTypeV2.ALBUM;
            return new TracklistV2(albumId, TracklistV2.resolveUri(albumId, type), type, page.totalSize, page);
        });
    }

}
