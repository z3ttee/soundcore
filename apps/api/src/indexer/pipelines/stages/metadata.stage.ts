import fs from "node:fs/promises";
import { Batch } from "@soundcore/common";
import { File, FileFlag } from "../../../file/entities/file.entity";
import { Mount } from "../../../mount/entities/mount.entity";
import { STAGE_METADATA_ID, STEP_CREATE_ALBUMS_ID, STEP_CREATE_ARTISTS_ID, STEP_READ_TAGS_ID } from "../../pipelines";
import { ID3TagsDTO } from "../../../song/dtos/id3-tags.dto";
import { Song } from "../../../song/entities/song.entity";
import { SongService } from "../../../song/services/song.service";
import { Artist } from "../../../artist/entities/artist.entity";
import { Album } from "../../../album/entities/album.entity";
import { Slug } from "@tsalliance/utilities";
import { DataSource } from "typeorm";
import { ArtistService } from "../../../artist/artist.service";
import { AlbumService } from "../../../album/services/album.service";
import { FileSystemService } from "../../../filesystem/services/filesystem.service";
import { getOrDefault, getSharedOrDefault, progress, set, StepParams } from "@soundcore/pipelines";

export async function step_read_mp3_tags(params: StepParams) {
    const { step, resources, logger } = params;

    const datasource: DataSource = resources.datasource;
    const repository = datasource.getRepository(Song);
    const fsService = new FileSystemService();
    const songService = new SongService(repository, null, null);
    
    // Prepare step
    const files: Map<string, File> = getSharedOrDefault("targetFiles", new Map());
    const mount: Mount = getSharedOrDefault(`mount`);

    if(!files || files.size <= 0) {
        step.skip("No new files were created in database.");
    }

    if(typeof mount === "undefined" || mount == null) {
        step.skip("Invalid mount checked out.")
    }

    // Map resources using keys consisting of unique properties,
    // like name, album name etc. This prevents duplicate insertions
    // and reduces the load of insert queries
    const artists: Map<string, Artist> = new Map();
    const albums: Map<string, Album> = new Map();
    const songs: Map<string, Song> = new Map();

    return Batch.useDataset<File, File>(Array.from(files.values())).onError((error: Error, batch, batchNr: number) => {
        for(const file of batch) {
            if(typeof file === "undefined" || file == null) continue;
            file.flag = FileFlag.ERROR;
        }

        // Handle errors
        logger.error(`Failed processing songs in batch #${batchNr}: ${error.message}`, error.stack);
    }).forEach(async (batch, currentBatch, totalBatches) => {
        const p = currentBatch / totalBatches;
        progress(p);

        for(const file of batch) {
            // Set mount for file context
            file.mount = mount;

            // Build filepath
            const filepath = fsService.resolveFilepath(file);
            logger.info(`Reading ID3 Tags of '${filepath}'`);
            
            // Remove mount from file, because it is not needed anymore
            delete file.mount;

            // Check if file can be accessed
            const canAccessFile: boolean = await fs.access(filepath).then(() => true).catch((error: Error) => {
                logger.error(`Failed accessing file ${filepath}: ${error?.message}`, error);
                return false;
            });
            // Skip this file if not accessable
            if(!canAccessFile) {
                file.flag = FileFlag.ERROR;
                continue;
            }

            // Read id3 tags from file
            const id3TagsDto: ID3TagsDTO = await songService.readID3TagsFromFile(filepath).catch((error: Error) => {
                logger.error(`Failed reading id3 tags from file ${filepath}: ${error?.message}`, error);
                return null;
            });
            if(typeof id3TagsDto === "undefined" || id3TagsDto == null) {
                file.flag = FileFlag.ERROR;
                continue;
            }

            // Create primary artist
            let primaryArtist: Artist;
            if(id3TagsDto?.artists?.length > 0) {
                const artist = id3TagsDto.artists.splice(0, 1)?.[0];
                if(typeof artist !== "undefined" && artist != null) {
                    primaryArtist = { name: artist?.name } as Artist;
                    artists.set(getArtistKey(primaryArtist), primaryArtist);
                }
            }

            // Create featured artists
            const featuredArtists: Artist[] = [];
            for(const artistDto of id3TagsDto.artists) {
                const featuredArtist = { name: artistDto.name } as Artist;
                featuredArtists.push(featuredArtist);
                artists.set(getArtistKey(featuredArtist), featuredArtist);
            }

            // Create album
            let album: Album;
            if(id3TagsDto?.album) {
                const albumName = id3TagsDto.album;
                if(typeof albumName !== "undefined" && albumName != null) {
                    album = { 
                        name: albumName, 
                        primaryArtist: primaryArtist ?? undefined
                    } as Album;

                    albums.set(getAlbumKey(album), album);
                }
            }

            const song: Song = {
                name: id3TagsDto.title ?? file.name,
                slug: Slug.create(id3TagsDto.title ?? file.name),
                duration: id3TagsDto.duration,
                order: id3TagsDto.orderNr,
                primaryArtist: primaryArtist,
                featuredArtists: featuredArtists,
                album: album,
                file: { id: file.id } as File
            } as Song;

            const songKey = getSongKey(song);
            if(songs.has(songKey)) {
                file.flag = FileFlag.POTENTIAL_DUPLICATE;
            } else {
                songs.set(songKey, song);
            }
        }

        return batch;
    }).then((processedFiles) => {
        set("songs", songs);
        set("albums", albums);
        set("artists", artists);
        logger.info(`Successfully extracted metadata from ${processedFiles.length} files: ${songs.size} Songs, ${albums.size} albums, ${artists.size} artists`);
    }).catch((error) => {
        throw error;
    });
}

/**
 * Create artists in database step.
 * @param stage Current stage
 * @param step Current step
 * @param datasource Datasource
 * @param logger Logger instance
 */
export async function step_create_artists(params: StepParams) {
    const { resources, step, logger } = params;

    // Prepare step
    const datasource: DataSource = resources.datasource;
    const repository = datasource.getRepository(Artist);
    const service = new ArtistService(repository, null);
    const artists: Map<string, Artist> = getOrDefault(`${STAGE_METADATA_ID}.${STEP_READ_TAGS_ID}.artists`, new Map());

    // Check if there are any artists to create them,
    // if not, skip the step
    if(!artists || artists.size <= 0) {
        step.skip("No artists found.");
        return;
    }

    // Create batching process
    return Batch.useDataset(Array.from(artists.values())).onError((error: Error, batch, batchNr: number) => {
        // Handle errors
        logger.error(`Failed processing artists in batch #${batchNr}: ${error.message}`, error.stack);
    }).map((batch, currentBatch, totalBatches) => {
        // Execute insert query
        return service.createIfNotExists(batch.map((artist) => {
            // Map slug
            artist.slug = Slug.create(artist.name);
            return artist;
        }), (query, alias) => query.select([`${alias}.id`, `${alias}.name`])).then((createdArtists) => {
            progress(currentBatch / totalBatches);
            return new Map(createdArtists.map((artist) => ([getArtistKey(artist), artist])));
        }).catch((error) => {
            throw error;
        });
    }).then((createdArtists) => {
        // Processing all batches done.
        // Write logs and create output
        logger.info(`Created and fetched ${createdArtists.size} artists.`);
        set("artists", createdArtists);
    }).catch((error: Error) => {
        // Batching process failed
        logger.error(`Failed creating artists: ${error.message}`, error);
        throw error;
    });
}

/**
 * Create albums in database step.
 * @param stage Current stage
 * @param step Current step
 * @param datasource Datasource
 * @param logger Logger instance
 */
export async function step_create_albums(params: StepParams) {
    const { resources, logger, step } = params;

    // Prepare step
    const datasource: DataSource = resources.datasource;
    const repository = datasource.getRepository(Album);
    const service = new AlbumService(repository, null, null);
    const artists: Map<string, Artist> = getOrDefault(`${STAGE_METADATA_ID}.${STEP_CREATE_ARTISTS_ID}.artists`, new Map());
    const albums: Map<string, Album> = getOrDefault(`${STAGE_METADATA_ID}.${STEP_READ_TAGS_ID}.albums`, new Map());

    // Check if there are any albums to create them,
    // if not, skip the step
    if(!albums || albums.size <= 0) {
        step.skip("No albums found.");
        return;
    }

    return Batch.useDataset(Array.from(albums.values())).onError((error: Error, batch, batchNr: number) => {
        // Handle errors
        logger.error(`Failed processing albums in batch #${batchNr}: ${error.message}`, error.stack);
    }).map((batch, currentBatch, totalBatches) => {
        // Create database entries
        return service.createIfNotExists(batch.map((album) => {
            // Map slug
            album.slug = Slug.create(album.name);
            // Map primaryArtist
            album.primaryArtist = artists.get(getArtistKey(album.primaryArtist)) ?? undefined;
            return album;
        })).then((createdAlbums) => {
            logger.info(`Batch #${currentBatch}: Created ${createdAlbums.length} albums.`);
            progress(currentBatch / totalBatches);
            return new Map(createdAlbums.map((album) => ([getAlbumKey(album), album])));
        }).catch((error: Error) => {
            logger.error(`Failed creating albums: ${error.message}`, error);
            throw error;
        });
    }).then((createdAlbums) => {
        // Processing all batches done.
        // Write logs and create output
        logger.info(`Created and fetched ${createdAlbums.size} albums.`);
        set("albums", createdAlbums);
    }).catch((error: Error) => {
        // Batching process failed
        logger.error(`Failed creating albums: ${error.message}`, error);
        throw error;
    });
}

/**
 * Create songs in database step.
 * @param params Parameters used for the current step
 */
export async function step_create_songs(params: StepParams) {
    // Deconstruct params
    const { logger, resources, step } = params;

    // Prepare step
    const datasource: DataSource = resources.datasource;
    const repository = datasource.getRepository(Song);
    const service = new SongService(repository, null, null);
    const artists: Map<string, Artist> = getOrDefault(`${STAGE_METADATA_ID}.${STEP_CREATE_ARTISTS_ID}.artists`, new Map());
    const albums: Map<string, Album> = getOrDefault(`${STAGE_METADATA_ID}.${STEP_CREATE_ALBUMS_ID}.albums`, new Map());
    const songs: Map<string, Song> = getOrDefault(`${STAGE_METADATA_ID}.${STEP_READ_TAGS_ID}.songs`, new Map());
    const files: Map<string, File> = getSharedOrDefault("targetFiles", new Map());

    // Check if there are any albums to create them,
    // if not, skip the step
    if(!songs || songs.size <= 0) {
        step.skip("No songs found.");
        return;
    }

    // Split the songs of previous steps into chunks
    // of 100 items each
    return Batch.useDataset(Array.from(songs.values())).onError((error: Error, batch, batchNr: number) => {
        // Log errors
        logger.error(`Failed processing songs in batch #${batchNr}: ${error.message}`, error.stack);

        // Set file flag to ERROR for songs
        for(const song of batch) {
            const file = files.get(song.file?.id);
            if(typeof file === "undefined" || file == null) continue;
            file.flag = FileFlag.ERROR;
        }
    }).map((batch, currentBatch, totalBatches) => {

        const songMappedByFiles: Map<string, Song> = new Map();

        // Map the songs from previous outputs using valid data.
        // Because artists and albums have been created previously, we can
        // now map their ids to the song dtos. This will create the songs in the database
        // using the correct relations.
        const mappedSongs: Song[] = batch.map((song) => {
            const s = {...song} as Song;
            s.primaryArtist = artists.get(getArtistKey(song.primaryArtist)) ?? undefined;
            s.album = albums.get(getAlbumKey(song.album)) ?? undefined;

            songMappedByFiles.set(s.file.id, s);
            return s;
        });

        // Create database entries
        return service.createIfNotExists(mappedSongs, (query, alias) => query.select([`${alias}.id`]).leftJoin(`${alias}.file`, "file").addSelect(["file.id"])).then((createdSongs) => {
            logger.info(`Batch #${currentBatch}: Created ${createdSongs.length} database entries.`);

            const mappedCreatedSongs: Song[] = [];
            // Map the created songs in the database and apply featuredArtists as they
            // were not saved using the standard insert-query.
            for(const s of createdSongs) {
                // We have to use the song dto from before the query, as the
                // query result has no featuredArtists
                const mappedSong = songMappedByFiles.get(s.file.id);

                // Check if there are any featured artists
                // If not, continue with next as we do not have to add it to
                // the save-query
                if(mappedSong.featuredArtists?.length <= 0) {
                    continue;
                }

                // Map featured artists
                s.featuredArtists = (mappedSong.featuredArtists ?? []).map((artist) => artists.get(getArtistKey(artist)) ?? undefined) ?? undefined;
                // Return the new mapped song
                mappedCreatedSongs.push(s);
            }
            
            // Perform a save-query using the mapped data
            return repository.save(mappedCreatedSongs).catch((error: Error) => {
                logger.error(`Failed saving featured artists on songs: ${error.message}`, error.stack);
                return [];
            }).then((list) => {
                logger.info(`Batch #${currentBatch}: Saved featured artists for ${list.length} song entries.`);
                progress(currentBatch / totalBatches);

                // Map created artists back to map
                const map: Map<string, Song> = new Map();
                for(const song of createdSongs) {
                    map.set(song.id, song);

                    const file = files.get(song.file?.id);
                    if(typeof file === "undefined" || file == null) continue;
                    file.flag = FileFlag.OK;
                }

                return map;
            })
        }).catch((error: Error) => {
            logger.error(`Failed creating songs in database: ${error.message}`, error.stack);
            throw error;
        });
    }).then((createdSongs) => {
        // Processing all batches done.
        // Write logs and create output
        logger.info(`Created and fetched ${createdSongs.size} songs.`);
        // set("songs", createdSongs);
    }).catch((error: Error) => {
        // Batching process failed
        logger.error(`Failed creating songs: ${error.message}`, error);
        throw error;
    });
}

function getArtistKey(artist: Artist): string {
    return `${artist?.name}`;
}

function getAlbumKey(album: Album): string {
    return `${album?.name}.${album?.primaryArtist?.name}`;
}

function getSongKey(song: Song): string {
    return `${song?.name}.${song?.primaryArtist?.name}.${song?.album?.name}`;
}
