import { BadRequestException, Injectable } from '@nestjs/common';
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

    public async findTracklist(ownerId: string, ownerType: PlayableEntityType, pageable: Pageable, authentication?: User, shuffled?: boolean, startWithId?: string): Promise<TracklistV2> {
        const seed = shuffled ? randomInt(8) : undefined;

        if(ownerType === PlayableEntityType.ALBUM) {
            return this.findTracklistByAlbumId(ownerId, pageable, authentication, seed, startWithId);
        } else if(ownerType === PlayableEntityType.ARTIST) {
            return this.findTracklistByArtistId(ownerId, pageable, authentication, seed, startWithId);
        } else if(ownerType === PlayableEntityType.ARTIST_TOP) {
            return this.findTracklistByArtistIdTop(ownerId, pageable, authentication, seed, startWithId);
        }
        
        throw new BadRequestException("Requested invalid tracklist");
    }

    public async findTracklistByAlbumId(albumId: string, pageable: Pageable, authentication?: User, seed?: number, startWithId?: string): Promise<TracklistV2> {
        return this.songService.findByAlbum(albumId, pageable, authentication, seed, startWithId).then((page) => {
            return new TracklistV2(albumId, PlayableEntityType.ALBUM, page.totalSize, page, seed ?? undefined);
        });
    }

    public async findTracklistByArtistId(artistId: string, pageable: Pageable, authentication?: User, seed?: number, startWithId?: string): Promise<TracklistV2> {
        return this.songService.findByArtist(artistId, pageable, authentication, seed, startWithId).then((page) => {
            return new TracklistV2(artistId, PlayableEntityType.ARTIST, page.totalSize, page, seed ?? undefined);
        });
    }

    public async findTracklistByArtistIdTop(artistId: string, pageable: Pageable, authentication?: User, seed?: number, startWithId?: string): Promise<TracklistV2> {
        return this.songService.findByArtistIdTop(artistId, pageable, authentication, seed, startWithId).then((page) => {
            return new TracklistV2(artistId, PlayableEntityType.ARTIST_TOP, page.totalSize, page, undefined);
        });
    }

}
