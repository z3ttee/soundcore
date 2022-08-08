import { EventEmitter2 } from "@nestjs/event-emitter";
import { DoneCallback, Job } from "bull";
import { AlbumService } from "../../album/album.service";
import { Album } from "../../album/entities/album.entity";
import { ArtistService } from "../../artist/artist.service";
import { Artist } from "../../artist/entities/artist.entity";
import { Artwork } from "../../artwork/entities/artwork.entity";
import { ArtworkService } from "../../artwork/services/artwork.service";
import { Distributor } from "../../distributor/entities/distributor.entity";
import { DistributorService } from "../../distributor/services/distributor.service";
import { Genre } from "../../genre/entities/genre.entity";
import { GenreService } from "../../genre/services/genre.service";
import { Label } from "../../label/entities/label.entity";
import { LabelService } from "../../label/services/label.service";
import { MeiliAlbumService } from "../../meilisearch/services/meili-album.service";
import { MeiliArtistService } from "../../meilisearch/services/meili-artist.service";
import { MeiliDistributorService } from "../../meilisearch/services/meili-distributor.service";
import { MeiliLabelService } from "../../meilisearch/services/meili-label.service";
import { MeiliPublisherService } from "../../meilisearch/services/meili-publisher.service";
import { MeiliSongService } from "../../meilisearch/services/meili-song.service";
import { Publisher } from "../../publisher/entities/publisher.entity";
import { PublisherService } from "../../publisher/services/publisher.service";
import { Song } from "../../song/entities/song.entity";
import { SongService } from "../../song/song.service";
import { GeniusFlag, Resource } from "../../utils/entities/resource";
import { DBWorker } from "../../utils/workers/worker.util";
import { GeniusProcessDTO, GeniusProcessType } from "../dtos/genius-process.dto";
import { GeniusClientService } from "../services/genius-client.service";

export default function (job: Job<GeniusProcessDTO>, dc: DoneCallback) {

    DBWorker.instance().then((worker) => {
        worker.establishConnection().then(async (dataSource) => {
            const fileSystem = worker.getFileSystem();
            const meiliClient = worker.meiliClient();

            const eventEmitter = new EventEmitter2();

            // Build services
            const meiliService = new MeiliArtistService(meiliClient);
            const artistService = new ArtistService(meiliService, eventEmitter, dataSource.getRepository(Artist));
            const albumService = new AlbumService(dataSource.getRepository(Album), eventEmitter, new MeiliAlbumService(meiliClient));
            const songService = new SongService(dataSource.getRepository(Song), new MeiliSongService(meiliClient));

            // Build GeniusClientService and dependencies
            const artworkService = new ArtworkService(dataSource.getRepository(Artwork), fileSystem);
            const labelService = new LabelService(dataSource.getRepository(Label), new MeiliLabelService(meiliClient));
            const distributorService = new DistributorService(dataSource.getRepository(Distributor), new MeiliDistributorService(meiliClient));
            const publisherService = new PublisherService(dataSource.getRepository(Publisher), new MeiliPublisherService(meiliClient));
            const genreService = new GenreService(dataSource.getRepository(Genre));
            const clientService = new GeniusClientService(artworkService, labelService, distributorService, publisherService, genreService);

            // Handle different types of
            // genius lookup processes
            switch (job.data.type) {
                case GeniusProcessType.ARTIST:
                    await lookupArtist(job, artistService, clientService, dc);
                    break;
                case GeniusProcessType.ALBUM:
                    await lookupAlbum(job, albumService, clientService, dc);
                    break;    
                case GeniusProcessType.SONG:
                    await lookupSong(job, songService, clientService, dc);
                    break;    
            
                default:
                    reportError(new Error("Unknown genius process type found."), dc);
                    break;
            }
        
        }).catch((error) => {
            reportError(error, dc);
        })
    })
}

/**
 * Lookup artist on genius
 * @param job Job information
 * @param service ArtistService
 * @param geniusService Genius ClientService
 * @param dc DoneCallback
 */
async function lookupArtist(job: Job<GeniusProcessDTO>, service: ArtistService, geniusService: GeniusClientService, dc: DoneCallback) {
    const artistData = job.data.payload as Artist;
    if(!artistData) {
        reportSuccess(null, dc);
        return;
    }
    // Update genius flag
    await service.setGeniusFlag(artistData, GeniusFlag.GENIUS_PENDING);

    // Lookup artist data
    geniusService.lookupArtist(artistData).then((artist) => {
        // Update genius flag
        artist.geniusFlag = GeniusFlag.OK;
        return service.save(artist).then(async (result) => {
            reportSuccess(result, dc);
        });
    }).catch(async (error) => {
        await service.setGeniusFlag(artistData, GeniusFlag.GENIUS_FAILED);
        reportError(error, dc);
    });
}

/**
 * Lookup album on genius
 * @param job Job information
 * @param service AlbumService
 * @param geniusService Genius ClientService
 * @param dc DoneCallback
 */
 async function lookupAlbum(job: Job<GeniusProcessDTO>, service: AlbumService, geniusService: GeniusClientService, dc: DoneCallback) {
    const albumData = job.data.payload as Album;
    if(!albumData) reportSuccess(null, dc);
    // Update genius flag
    await service.setGeniusFlag(albumData, GeniusFlag.GENIUS_PENDING);

    // Lookup album data
    geniusService.lookupAlbum(albumData).then((album) => {
        // Update genius flag
        album.geniusFlag = GeniusFlag.OK;
        return service.save(album).then(async (result) => {
            reportSuccess(result, dc);
        });
    }).catch(async (error) => {
        await service.setGeniusFlag(albumData, GeniusFlag.GENIUS_FAILED);
        reportError(error, dc);
    });
}

/**
 * Lookup song on genius
 * @param job Job information
 * @param service SongService
 * @param geniusService Genius ClientService
 * @param dc DoneCallback
 */
 async function lookupSong(job: Job<GeniusProcessDTO>, service: SongService, geniusService: GeniusClientService, dc: DoneCallback) {
    const songData = job.data.payload as Song;
    if(!songData) reportSuccess(null, dc);
    // Update genius flag
    await service.setGeniusFlag(songData, GeniusFlag.GENIUS_PENDING);

    // Lookup song data
    geniusService.lookupSong(songData).then((song) => {
        // Update genius flag
        song.geniusFlag = GeniusFlag.OK;
        return service.save(song).then(async (result) => {
            reportSuccess(result, dc);
        });
    }).catch(async (error) => {
        await service.setGeniusFlag(songData, GeniusFlag.GENIUS_FAILED);
        reportError(error, dc);
    });
}

function reportSuccess(result: Resource, dc: DoneCallback) {
    dc(null, result);
}

function reportError(error: Error, dc: DoneCallback) {
    dc(error, null);
}