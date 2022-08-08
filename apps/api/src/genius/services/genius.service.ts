import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Queue } from 'bull';
import { Album } from '../../album/entities/album.entity';
import { Artist } from '../../artist/entities/artist.entity';
import { EVENT_ARTIST_CHANGED, EVENT_METADATA_CREATED, QUEUE_GENIUS_NAME } from '../../constants';
import { ArtistChangedEvent } from '../../events/artist-changed.event';
import { IndexerResultDTO } from '../../indexer/dtos/indexer-result.dto';
import { Song } from '../../song/entities/song.entity';
import { GeniusProcessDTO, GeniusProcessType } from '../dtos/genius-process.dto';

@Injectable()
export class GeniusService {
    private readonly logger: Logger = new Logger(GeniusService.name);

    constructor(
        @InjectQueue(QUEUE_GENIUS_NAME) private readonly queue: Queue<GeniusProcessDTO>
    ) {}
    
    @OnEvent(EVENT_METADATA_CREATED)
    public async handleMetadataCreatedEvent(payload: IndexerResultDTO) {
        if(payload?.createdSong) this.createSongLookupJob(payload.createdSong);
        if(payload?.createdAlbum) this.createAlbumLookupJob(payload.createdAlbum);
        if(payload?.createdArtists && payload.createdArtists.length > 0) {
            for(const artist of payload.createdArtists) {
                this.createArtistLookupJob(artist);
            }
        }
    }

    @OnEvent(EVENT_ARTIST_CHANGED)
    public async handleArtistChangedEvent(payload: ArtistChangedEvent) {
        this.createArtistLookupJob(payload.data)
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
