import { DoneCallback, Job } from "bull";
import { ArtistService } from "../../artist/artist.service";
import { SongService } from "../../song/song.service";
import { IndexerProcessDTO, IndexerProcessMode } from "../dtos/indexer-process.dto";

import fs from "fs";
import path from "path";
import { Artist } from "../../artist/entities/artist.entity";
import { AlbumService } from "../../album/album.service";
import { ArtworkService } from "../../artwork/services/artwork.service";
import { Artwork } from "../../artwork/entities/artwork.entity";
import { Logger } from "@nestjs/common";
import { DBWorker } from "../../utils/workers/worker.util";
import { FileService } from "../../file/services/file.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { File, FileFlag } from "../../file/entities/file.entity";
import { IndexerResultDTO } from "../dtos/indexer-result.dto";
import { Song } from "../../song/entities/song.entity";
import { Album } from "../../album/entities/album.entity";
import { MeiliArtistService } from "../../meilisearch/services/meili-artist.service";
import { MeiliAlbumService } from "../../meilisearch/services/meili-album.service";
import { MeiliSongService } from "../../meilisearch/services/meili-song.service";
import { CreateResult } from "../../utils/results/creation.result";

const logger = new Logger("IndexerWorker");

export default function (job: Job<IndexerProcessDTO>, dc: DoneCallback) {
    const mount = job.data.file.mount;
    const file = job.data.file;
    const mode = job.data.mode || IndexerProcessMode.SCAN;
    const filepath = path.join(mount.directory, file.directory, file.name);

    DBWorker.instance().then((worker) => {
        worker.establishConnection().then((dataSource) => {
            const meiliClient = worker.meiliClient();
            const fileSystem = worker.getFileSystem();

            const eventEmitter = new EventEmitter2();

            const songRepo = dataSource.getRepository(Song);
            const artistRepo = dataSource.getRepository(Artist);
            const albumRepo = dataSource.getRepository(Album);
            const artworkRepo = dataSource.getRepository(Artwork);
            const fileRepo = dataSource.getRepository(File);
    
            const songService = new SongService(songRepo, new MeiliSongService(meiliClient));
            const artistService = new ArtistService(new MeiliArtistService(meiliClient), eventEmitter, artistRepo);
            const albumService = new AlbumService(albumRepo, eventEmitter, new MeiliAlbumService(meiliClient));
            const artworkService = new ArtworkService(artworkRepo, fileSystem);
            const fileService = new FileService(fileRepo, eventEmitter, null);
    
            // Check if file is accessible by the process
            fs.access(filepath, (err) => {
                if(err) {
                    reportError(err);
                    return;
                }
    
                // Read ID3 Tags from mp3 files.
                songService.readID3TagsFromFile(filepath).then(async (id3Tags) => {
                    const songTitle = id3Tags.title.trim();
                    const id3Artists = id3Tags.artists || [];
    
                    // Create all artists found in id3tags if they do not already exist in database.
                    const featuredArtistsResults: CreateResult<Artist>[] = await Promise.all(id3Artists.map(async (artist) => (await artistService.createIfNotExists({
                        name: artist.name
                    }))));

                    // First artist in artists array becomes primary artist
                    // as they are listed first most of the times (can be changed later
                    // by admins)
                    const primaryArtistResult = featuredArtistsResults.splice(0, 1)[0];
                    const primaryArtist = primaryArtistResult?.data;

                    let albumResult: CreateResult<Album> = null;
                    if(id3Tags.album) {
                        // Create album found in id3tags if not exists.
                        albumResult = await albumService.createIfNotExists({
                            name: id3Tags.album,
                            primaryArtist: primaryArtist
                        });
                    }

                    // Create song if not exists.
                    const songResult = await songService.createIfNotExists({
                        duration: id3Tags.duration,
                        name: songTitle,
                        file: file,
                        album: albumResult?.data,
                        order: id3Tags.orderNr,
                        primaryArtist: primaryArtist,
                        featuredArtists: featuredArtistsResults.map((result) => result.data)
                    });
    
                    // Create artwork if a similar one does not already exist.
                    const artwork: Artwork = await artworkService.createForSongIfNotExists(songResult.data, true, id3Tags.cover);
                    songService.setArtwork(songResult.data, artwork);
    
                    // If the mode is set to SCAN, it means the file will be 
                    // scanned from scratch and possibly overwrite data.
                    if(mode == IndexerProcessMode.SCAN) {
                        // Is there already a song existing with the scanned
                        // metadata? If so, mark file as duplicate
                        // Otherwise update the file's relation to 
                        // point to newly created song
                        if(songResult.existed) {
                            // logger.warn(`Found a duplicate song file '${filepath}'. Is a duplicate of: ${song.name} by ${song.primaryArtist.name} of album ${song.album.name}`);
                            reportError(new Error("Duplicate song file detected."), FileFlag.DUPLICATE, true);
                            return;
                        } else {
                            // Update the file's relation to the created song.
                            await fileService.setSong(file, songResult.data);
                        }
                    } else {
                        if(!songResult.existed) {
                            reportError(new Error("Rescanning a file that was never scanned before is not allowed."));
                            return;
                        } else {
                            // At this point, the scan-mode is set to RESCAN (meaning the file should be updated)
                            logger.warn(`Song for file '${filepath}' already existed. Updating song metadata...`);
                            await songService.setArtwork(songResult.data, artwork);
                            await songService.setAlbumOrder(songResult.data, id3Tags.orderNr);
                            await fileService.setSong(file, songResult.data);
                        }
                    }
                    
                    // Clear circular structure
                    file.song = null;

                    const createdArtists: Artist[] = [];
                    // Check if primaryArtist was newly created.
                    if(!primaryArtistResult?.existed) {
                        createdArtists.push(primaryArtist);
                    }

                    // Add artists to array, that were newly created.
                    for(const featuredResult of featuredArtistsResults) {
                        if(!featuredResult?.existed) createdArtists.push(featuredResult?.data);
                    }

                    // End worker by reporting success
                    reportSuccess({
                        song: songResult.data,
                        createdSong: songResult.existed ? null : songResult.data,
                        createdAlbum: albumResult?.existed ? null : albumResult?.data,
                        createdArtists: createdArtists
                    });
                }).catch((error) => {
                    reportError(error);
                });
            })

            /**
             * Report success and return the result to the queue.
             * @param result Result to return to queue.
             */
            async function reportSuccess(result: IndexerResultDTO) {
                job.finishedOn = Date.now();
                dc(null, result);
            }

            /**
             * Report error and return to queue.
             * @param error Error object to throw
             * @param fileFlag (Optional) Set a new flag for status reporting.
             */
            async function reportError(error: Error, fileFlag: FileFlag = FileFlag.FAILED_SONG_CREATION, skipRetry = false) {
                await fileService.setFlag(file, fileFlag);
                
                if(skipRetry) dc(null, null);
                else dc(error, null);
            }

        }).catch((error) => {
            reportError(error);
        });
    });

    function reportError(error: Error) {
        dc(error, null);
    }
}



