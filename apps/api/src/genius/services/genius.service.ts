import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Album } from '../../album/entities/album.entity';
import { Artist } from '../../artist/entities/artist.entity';
import { EVENT_METADATA_CREATED } from '../../constants';
import { IndexerResultDTO } from '../../indexer/dtos/indexer-result.dto';
import { Song } from '../../song/entities/song.entity';

@Injectable()
export class GeniusService {
    private readonly logger: Logger = new Logger(GeniusService.name);

    constructor() {}
    
    @OnEvent(EVENT_METADATA_CREATED)
    public async handleMetadataCreatedEvent(payload: IndexerResultDTO) {
        // if(payload?.createdSong) this.createSongLookupJob(payload.createdSong);
        // if(payload?.createdAlbum) this.createAlbumLookupJob(payload.createdAlbum);
        // if(payload?.createdArtists && payload.createdArtists.length > 0) {
        //     for(const artist of payload.createdArtists) {
        //         this.createArtistLookupJob(artist);
        //     }
        // }

        this.logger.debug(`Received event ${EVENT_METADATA_CREATED}`);
    }

    public async createSongLookupJob(song: Song) {
        // const dto = new GeniusProcessDTO<Song>(GeniusProcessType.SONG, song);
        // return this.queue.add(dto);
    } 

    public async createAlbumLookupJob(album: Album) {
        // const dto = new GeniusProcessDTO<Album>(GeniusProcessType.ALBUM, album);
        // return this.queue.add(dto);
    } 

    public async createArtistLookupJob(artist: Artist) {
        // const dto = new GeniusProcessDTO<Artist>(GeniusProcessType.ARTIST, artist);
        // return this.queue.add(dto);
    } 
}
