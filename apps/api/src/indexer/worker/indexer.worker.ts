import fs from "node:fs/promises";
import path from "node:path";
import workerpool from "workerpool";

import { ArtistService } from "../../artist/artist.service";
import { SongService } from "../../song/song.service";
import { IndexerProcessDTO } from "../dtos/indexer-process.dto";

import { Artist } from "../../artist/entities/artist.entity";
import { AlbumService } from "../../album/album.service";
import { ArtworkService } from "../../artwork/services/artwork.service";
import { Artwork } from "../../artwork/entities/artwork.entity";
import { Logger } from "@nestjs/common";
import { FileService } from "../../file/services/file.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { File, FileFlag } from "../../file/entities/file.entity";
import { IndexerCreatedResources, IndexerResultDTO, IndexerResultEntry } from "../dtos/indexer-result.dto";
import { Song } from "../../song/entities/song.entity";
import { Album } from "../../album/entities/album.entity";
import { MeiliArtistService } from "../../meilisearch/services/meili-artist.service";
import { MeiliAlbumService } from "../../meilisearch/services/meili-album.service";
import { MeiliSongService } from "../../meilisearch/services/meili-song.service";
import { CreateResult } from "../../utils/results/creation.result";
import Database from "../../utils/database/database-worker-client";
import { FileSystemService } from "../../filesystem/services/filesystem.service";
import MeiliClient from "../../utils/database/meilisearch-worker-client";
import { WorkerJobRef, WorkerProgressEvent } from "@soundcore/nest-queue";
import { ID3TagsDTO } from "../../song/dtos/id3-tags.dto";
import Debug from "../../utils/debug";
import { Batching } from "../../utils/batching";

const logger = new Logger("IndexWorker");
const BATCH_SIZE = 100;

class BatchResult {
    constructor(
        public readonly entries: IndexerResultEntry[],
        public readonly resources: IndexerCreatedResources
    ) {}
}

export default function (job: WorkerJobRef<IndexerProcessDTO>): Promise<IndexerResultDTO> {
    const { files, mount } = job.payload;

    return Database.connect().then((dataSource) => {
        return MeiliClient.connect().then((meiliClient) => {
            const startTimeMs = Date.now();

            const fileSystem = new FileSystemService();
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
            const fileService = new FileService(fileRepo);

            const createdResources: IndexerCreatedResources = new IndexerCreatedResources();

            return Batching.of<File, IndexerResultEntry>(files, BATCH_SIZE).do(async (batch) => {
                const entries: IndexerResultEntry[] = [];

                const successFiles: File[] = [];
                const duplicates: File[] = [];

                // TODO: Work out how this can be batched. Currently this approach is spamming the database
                for(const file of batch) {
                    const fileReadStartTime = Date.now();
                    const filepath = path.resolve(path.join(mount.directory, file.directory, file.name));

                    if(Debug.isDebug) {
                        logger.debug(`Analyzing ID3-Tags of file ${filepath}...`);
                    }

                    // Check if file can be accessed
                    const canAccessFile: boolean = await fs.access(filepath).then(() => true).catch((error: Error) => {
                        logger.warn(`Failed accessing file ${filepath}: ${error?.message}`);
                        return false;
                    });
                    // Skip this file if not accessable
                    if(!canAccessFile) continue;

                    // Read id3 tags from file
                    const id3TagsDto: ID3TagsDTO = await songService.readID3TagsFromFile(filepath).catch((error: Error) => {
                        logger.warn(`Failed reading id3 tags from file ${filepath}: ${error?.message}`);
                        return null;
                    });

                    // Prepare variable.
                    let songResult: CreateResult<Song> = null;
                    let albumResult: CreateResult<Album> = null;

                    // Create a song from the file but without using id3 tags, if none exist
                    if(!id3TagsDto) {
                        // Create song if not exists.
                        songResult = await songService.createIfNotExists({
                            duration: 0,
                            name: file.name,
                            file: file,
                        }).catch((error: Error) => {
                            logger.warn(`Could not create song from file ${filepath}: ${error?.message}`);
                            return null;
                        });

                        createdResources.songs.push(songResult.data);
                    } else {
                        // Create song from id3 tags

                        // Prevent errors from being thrown
                        const songTitle = id3TagsDto.title.trim();
                        const id3Artists = id3TagsDto.artists || [];
        
                        // Create all artists found in id3tags if they do not already exist in database.
                        const featuredArtistsResults: CreateResult<Artist>[] = await Promise.all(id3Artists.map(async (artist) => (await artistService.createIfNotExists({
                            name: artist.name
                        }).catch((error: Error) => {
                            logger.warn(`Could not create featured artists found on file ${filepath}: ${error?.message}`);
                            return null;
                        }))).filter((item) => !!item));

                        // First artist in artists array becomes primary artist
                        // as they are listed first most of the times (can be changed later
                        // by admins)
                        const primaryArtistResult = featuredArtistsResults.length > 0 ? featuredArtistsResults.splice(0, 1)[0] : null;
                        const primaryArtist = primaryArtistResult?.data;

                        // Create album which was found on id3tags
                        if(id3TagsDto.album) {
                            // Create album found in id3tags if not exists.
                            albumResult = await albumService.createIfNotExists({
                                name: id3TagsDto.album,
                                primaryArtist: primaryArtist
                            }).catch((error: Error) => {
                                logger.warn(`Failed creating album found on file ${filepath}: ${error?.message}`);
                                return null;
                            });
                        }

                        // Create song if not exists.
                        songResult = await songService.createIfNotExists({
                            duration: id3TagsDto.duration || 0,
                            name: songTitle,
                            file: file,
                            album: albumResult?.data,
                            order: id3TagsDto.orderNr,
                            primaryArtist: primaryArtist,
                            featuredArtists: featuredArtistsResults.map((result) => result.data)
                        }).catch((error: Error) => {
                            logger.warn(`Could not create song from file ${filepath}: ${error?.message}`);
                            return null;
                        });

                        // Skip current file if no song was created
                        if(songResult) {
                            // Check if song existed in database
                            if(songResult.existed) {
                                // logger.warn(`Found a duplicate song file '${filepath}'. Is a duplicate of: ${song.name} by ${song.primaryArtist.name} of album ${song.album.name}`);
                                // reportError(new Error("Duplicate song file detected."), FileFlag.DUPLICATE, true);
                                logger.warn(`File ${filepath} could be a potential duplicate. Marking as such. User action is required.`);

                                // Push to duplicates
                                duplicates.push(file);

                                continue;
                            } else {
                                // Update the file's relation to the created song.
                                await fileService.setSong(file, songResult.data);
                            }
            
                            // Create artwork if a similar one does not already exist.
                            const artwork: Artwork = await artworkService.createForSongIfNotExists(songResult.data, true, id3TagsDto.cover).catch((error: Error) => {
                                logger.warn(`Could not create artwork found on file ${filepath}: ${error?.message}`);
                                return null;
                            });
                            songService.setArtwork(songResult.data, artwork);
                            
                            // Clear circular structure
                            file.song = null;
                            
                            // Check if primaryArtist was newly created.
                            if(!primaryArtistResult?.existed) {
                                createdResources.artists.push(primaryArtist);
                            }

                            // Add artists to array, that were newly created.
                            for(const featuredResult of featuredArtistsResults) {
                                if(!featuredResult?.existed) createdResources.artists.push(featuredResult?.data);
                            }

                            if(!albumResult?.existed) {
                                createdResources.albums.push(albumResult.data);
                            }

                            // Add resources to list
                            createdResources.songs.push(songResult.data);
                        }
                    }

                    // Skip if there is no song data
                    if(!songResult?.data) {
                        continue;
                    }

                    // Add to success array so the file flag can be changed later
                    successFiles.push(file);

                    // Prepare result and push to results array
                    const timeTookMs = Date.now() - fileReadStartTime;
                    entries.push(new IndexerResultEntry(filepath, timeTookMs));
                }

                // Set flag for duplicate files
                await fileService.setFlags(duplicates, FileFlag.POTENTIAL_DUPLICATE);
                await fileService.setFlags(successFiles, FileFlag.OK);

                return entries;
            }).progress((batches, current) => {
                const progress = Math.round((current / batches) * 100);

                job.progress = progress;
                workerpool.workerEmit(new WorkerProgressEvent(job));

                if(Debug.isDebug) {
                    logger.debug(`Analyzing ID3 Tags of files on mount '${mount.name}'... ${progress}%`);
                }
            }).catch((batchNr, error) => {
                logger.warn(`An error occured while processing batch #${batchNr}: ${error.message}`);
            })
            .start()
            .then((result) => {
                const timeTookMs = Date.now() - startTimeMs;
                return new IndexerResultDTO(result, createdResources, timeTookMs);
            });
        });
    });
}



