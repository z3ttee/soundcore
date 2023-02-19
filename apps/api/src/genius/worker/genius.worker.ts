import { WorkerJobRef } from "@soundcore/nest-queue";

import { GeniusProcessDTO } from "../dtos/genius-process.dto";
import { Batch } from "@soundcore/common";

export default async function (job: WorkerJobRef<GeniusProcessDTO>): Promise<any> {
    // return Batch.of(job.payload.payload).do((batch) => {
    //     const results = [];

    //     return results;
    // }).catch((batchNr, error) => {
    //     console.error(error);
    // }).progress((batches, current) => {
    //     console.log("progress: ", ((current / batches) * 100).toFixed(2));
    // }).start().then((resources) => {

    // });
    return null;
}

// export default function (job: Job<GeniusProcessDTO>, dc: DoneCallback) {

//     Database.connect().then((dataSource) => {
//         MeiliClient.connect().then(async (meiliClient) => {
//             const fileSystem = new FileSystemService();
//             const eventEmitter = new EventEmitter2();

//             // Build services
//             const meiliService = new MeiliArtistService(meiliClient);
//             const artistService = new ArtistService(meiliService, eventEmitter, dataSource.getRepository(Artist));
//             const albumService = new AlbumService(dataSource.getRepository(Album), eventEmitter, new MeiliAlbumService(meiliClient));
//             const songService = new SongService(dataSource.getRepository(Song), new MeiliSongService(meiliClient));

//             // Build GeniusClientService and dependencies
//             const artworkService = new ArtworkService(dataSource.getRepository(Artwork), fileSystem);
//             const labelService = new LabelService(dataSource.getRepository(Label), new MeiliLabelService(meiliClient));
//             const distributorService = new DistributorService(dataSource.getRepository(Distributor), new MeiliDistributorService(meiliClient));
//             const publisherService = new PublisherService(dataSource.getRepository(Publisher), new MeiliPublisherService(meiliClient));
//             const genreService = new GenreService(dataSource.getRepository(Genre));
//             const clientService = new GeniusClientService(artworkService, labelService, distributorService, publisherService, genreService);

//             // Handle different types of
//             // genius lookup processes
//             switch (job.data.type) {
//                 case GeniusProcessType.ARTIST:
//                     await lookupArtist(job, artistService, clientService, dc);
//                     break;
//                 case GeniusProcessType.ALBUM:
//                     await lookupAlbum(job, albumService, clientService, dc);
//                     break;    
//                 case GeniusProcessType.SONG:
//                     await lookupSong(job, songService, clientService, dc);
//                     break;    
            
//                 default:
//                     reportError(new Error("Unknown genius process type found."), dc);
//                     break;
//             }
        
//         }).catch((error) => {
//             reportError(error, dc);
//         })
//     })
// }

// /**
//  * Lookup artist on genius
//  * @param job Job information
//  * @param service ArtistService
//  * @param geniusService Genius ClientService
//  * @param dc DoneCallback
//  */
// async function lookupArtist(job: Job<GeniusProcessDTO>, service: ArtistService, geniusService: GeniusClientService, dc: DoneCallback) {
//     const artistData = job.data.payload as Artist;
//     if(!artistData) {
//         reportSuccess(null, dc);
//         return;
//     }
//     // Update genius flag
//     await service.setGeniusFlag(artistData, GeniusFlag.GENIUS_PENDING);

//     // Lookup artist data
//     geniusService.lookupArtist(artistData).then((artist) => {
//         // Update genius flag
//         artist.geniusFlag = GeniusFlag.OK;
//         return service.save(artist).then(async (result) => {
//             reportSuccess(result, dc);
//         });
//     }).catch(async (error) => {
//         await service.setGeniusFlag(artistData, GeniusFlag.GENIUS_FAILED);
//         reportError(error, dc);
//     });
// }

// /**
//  * Lookup album on genius
//  * @param job Job information
//  * @param service AlbumService
//  * @param geniusService Genius ClientService
//  * @param dc DoneCallback
//  */
//  async function lookupAlbum(job: Job<GeniusProcessDTO>, service: AlbumService, geniusService: GeniusClientService, dc: DoneCallback) {
//     const albumData = job.data.payload as Album;
//     if(!albumData) reportSuccess(null, dc);
//     // Update genius flag
//     await service.setGeniusFlag(albumData, GeniusFlag.GENIUS_PENDING);

//     // Lookup album data
//     geniusService.lookupAlbum(albumData).then((album) => {
//         // Update genius flag
//         album.geniusFlag = GeniusFlag.OK;
//         return service.save(album).then(async (result) => {
//             reportSuccess(result, dc);
//         });
//     }).catch(async (error) => {
//         await service.setGeniusFlag(albumData, GeniusFlag.GENIUS_FAILED);
//         reportError(error, dc);
//     });
// }

// /**
//  * Lookup song on genius
//  * @param job Job information
//  * @param service SongService
//  * @param geniusService Genius ClientService
//  * @param dc DoneCallback
//  */
//  async function lookupSong(job: Job<GeniusProcessDTO>, service: SongService, geniusService: GeniusClientService, dc: DoneCallback) {
//     const songData = job.data.payload as Song;
//     if(!songData) reportSuccess(null, dc);
//     // Update genius flag
//     await service.setGeniusFlag(songData, GeniusFlag.GENIUS_PENDING);

//     // Lookup song data
//     geniusService.lookupSong(songData).then((song) => {
//         // Update genius flag
//         song.geniusFlag = GeniusFlag.OK;
//         return service.save(song).then(async (result) => {
//             reportSuccess(result, dc);
//         });
//     }).catch(async (error) => {
//         await service.setGeniusFlag(songData, GeniusFlag.GENIUS_FAILED);
//         reportError(error, dc);
//     });
// }

// function reportSuccess(result: Resource, dc: DoneCallback) {
//     dc(null, result);
// }

// function reportError(error: Error, dc: DoneCallback) {
//     dc(error, null);
// }