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
import { Environment } from "@soundcore/common";
import { Batch } from "@soundcore/common";
import { CreateArtistDTO } from "../../artist/dtos/create-artist.dto";
import { CreateAlbumDTO } from "../../album/dto/create-album.dto";
import { CreateSongDTO } from "../../song/dtos/create-song.dto";
import { Mount } from "../../mount/entities/mount.entity";

const logger = new Logger("IndexWorker");
const BATCH_SIZE = 100;

class BatchResult {
    constructor(
        public readonly entries: IndexerResultEntry[],
        public readonly resources: IndexerCreatedResources
    ) {}
}

export interface ID3Album {
    name: string;
    primaryArtist?: CreateArtistDTO;
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
    
            const songService = new SongService(songRepo, new EventEmitter2(), new MeiliSongService(meiliClient));
            const artistService = new ArtistService(artistRepo, new MeiliArtistService(meiliClient));
            const albumService = new AlbumService(albumRepo, eventEmitter, new MeiliAlbumService(meiliClient));
            const artworkService = new ArtworkService(artworkRepo, fileSystem);
            const fileService = new FileService(fileRepo);

            const createdResources: IndexerCreatedResources = new IndexerCreatedResources();

            return Batch.of<File, IndexerResultEntry>(files, BATCH_SIZE).do(async (batch) => {
                const entries: IndexerResultEntry[] = [];

                const collectedFiles: Map<string, File> = new Map();

                const artists: Map<string, CreateArtistDTO> = new Map();
                const albums: Map<string, CreateAlbumDTO> = new Map();
                const songs: Map<string, CreateSongDTO> = new Map();

                for(const file of batch) {
                    // Set mount for file context
                    file.mount = mount;

                    const fileReadStartTime = Date.now();
                    const filepath = path.resolve(path.join(mount.directory, file.directory, file.name));

                    if(Environment.isDebug) {
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

                    // Extract artists
                    const id3Artists: CreateArtistDTO[] = id3TagsDto?.artists || [];

                    // Collect artists for building batched database query
                    for(const id3Artist of id3Artists) {
                        if(!artists.has(id3Artist.name)) {
                            artists.set(id3Artist.name, id3Artist);
                        }
                    }

                    // Extract primary artist
                    const primaryId3Artist: CreateArtistDTO = id3Artists.splice(0, 1)?.[0];

                    // Extract album
                    let album: CreateAlbumDTO = undefined;
                    if(id3TagsDto?.album) {
                        // Collect album for batched db query
                        album = {
                            name: id3TagsDto.album,
                            primaryArtist: primaryId3Artist as Artist
                        }

                        albums.set(getAlbumMapKey(id3TagsDto.album, primaryId3Artist), album);
                    }

                    // Extract song and collect data
                    const song: CreateSongDTO = {
                        file: file,
                        name: id3TagsDto.title,
                        duration: id3TagsDto.duration,
                        order: id3TagsDto.orderNr,
                        album: album as Album,
                        primaryArtist: primaryId3Artist as Artist,
                        featuredArtists: id3Artists as Artist[],
                    }

                    const key = getSongMapKey(song);
                    songs.set(key, song);
                    // if(songs.has(key)) {
                    //     logger.warn(`Found potential duplicate song file: ${filepath}. Marking as duplicate. User action is required.`);
                    //     duplicates.push(file);
                    //     continue;
                    // } else {
                    //     songs.set(key, song);
                    // }

                    // Add to success array so the file flag can be changed later
                    collectedFiles.set(file.id, file);

                    // Prepare result and push to results array
                    const timeTookMs = Date.now() - fileReadStartTime;
                    entries.push(new IndexerResultEntry(filepath, timeTookMs));
                }

                // Create database entries for collected artists
                const collectedArtists = Array.from(artists.values());
                const artistResults = await artistService.createIfNotExists(collectedArtists);
                // const artistResults = await artistService.findByIds(artistIds);
                const createdArtists = new Map<string, Artist>();
                
                for(const artist of artistResults) {
                    createdArtists.set(artist.name, artist);
                    createdResources.artists.push(artist);
                }

                // Create database entries for collected albums
                const albumCreationResult = await albumService.createIfNotExists(Array.from(albums.values()).map((album) => {    
                    // Map previous primaryArtist data with the created data from above                
                    album.primaryArtist = createdArtists.get(album.primaryArtist.name);
                    return album;
                }));
                const createdAlbums = new Map<string, Album>();

                for(const album of albumCreationResult) {
                    createdAlbums.set(getAlbumMapKey(album.name, album.primaryArtist), album);
                    createdResources.albums.push(album);
                }
                
                // Create database entries for collected songs
                const songCreationResult = await songService.createIfNotExists(Array.from(songs.values()).map((song) => {
                    const album = createdAlbums.get(getAlbumMapKey(song.album?.name, song.album?.primaryArtist));

                    // Map previous primaryArtist and album data with the created data from above      
                    song.primaryArtist = createdArtists.get(song.primaryArtist.name);
                    song.album = album;          
                    return song;
                }));

                // Used to check for duplicates later
                const createdSongFileIds: string[] = [];

                // Insert query seems not to be able to insert many-to-many relations.
                // So at this point the featuredArtists are updated
                await songService.saveAll(songCreationResult.map((song) => {   
                    const file = song.file;
                    file.mount = mount;

                    createdSongFileIds.push(file.id);
                    createdResources.songs.push(song);

                    const key = getSongMapKey(song);
                    const collectedSong = songs.get(key);
                    const featuredArtists: Artist[] = collectedSong?.featuredArtists?.map((artist) => createdArtists.get(artist.name)) || [];
                    
                    if(!collectedSong) {
                        if(file) {
                            const filepath = fileSystem.resolveFilepath(file);
                            const missingAttributes = [];

                            if(!song.primaryArtist) missingAttributes.push("primaryArtist");
                            if(!song.album) missingAttributes.push("album");

                            // Print which attrs are missing
                            logger.warn(`Found song that was created but is not tracked by indexer internally. Missing attributes [${missingAttributes.join(", ")}, key: ${key}] on song entity. File: ${filepath}`);
                        } else {
                            logger.warn(`Song has some invalid data. No file attached to it. Song ID: ${song.id}`);
                        }
                    }

                    const artists = featuredArtists;
                    song.featuredArtists = artists;
                    return song;
                }));

                // Check for duplicates
                const successFiles: File[] = [];
                const duplicates: File[] = [];

                batch.forEach((file) => {
                    if(createdSongFileIds.includes(file.id)) {
                        successFiles.push(file)
                    } else {
                        duplicates.push(file);
                    }
                })

                // Set flag for duplicate files
                // TODO: Collect errored files (where query has failed somehow)
                await fileService.setFlags(duplicates, FileFlag.POTENTIAL_DUPLICATE);
                await fileService.setFlags(successFiles, FileFlag.OK);

                // TODO: Create artwork via queue and workers

                return entries;
            }).progress((batches, current) => {
                const progress = Math.round((current / batches) * 100);

                job.progress = progress;
                workerpool.workerEmit(new WorkerProgressEvent(job));

                logger.verbose(`Indexing files on mount '${mount.name}': ${progress.toFixed(2)}%`);
            }).catch((batchNr, error) => {
                logger.warn(`An error occured while processing batch #${batchNr}: ${error.message}`);
            })
            .start()
            .then((result) => {
                const timeTookMs = Date.now() - startTimeMs;
                return new IndexerResultDTO(result, createdResources, timeTookMs);
            });

            /**
             * Helper function to create key for the songs map
             * @param file File data
             */
            function getSongMapKey(song: CreateSongDTO) {
                return `${song.name}:${song.duration}:${song.order}:${song.primaryArtist?.name}:${song.album?.name}`;
            }

            /**
             * Helper function to create key for the albums map
             * @param name Name of the album
             * @param primaryArtist Primary artist of the album
             */
            function getAlbumMapKey(name: string, primaryArtist?: Artist | CreateArtistDTO) {
                return `${name}:${primaryArtist?.name}`;
            }
        });
    });

    
}





