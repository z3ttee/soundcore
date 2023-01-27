import path from "node:path";
import fs from "node:fs/promises";
import { Batch } from "@soundcore/common";
import { PipelineLogger, PipelineRef, StageRef, StepRef } from "@soundcore/worker";
import { File } from "../../../file/entities/file.entity";
import { Mount } from "../../../mount/entities/mount.entity";
import { STAGE_SCAN_ID, STEP_CHECKOUT_MOUNT_ID, STEP_INDEX_FILES_ID, STEP_READ_TAGS, STEP_SAVE_ALBUMS, STEP_SAVE_ARTISTS } from "../../pipelines";
import { ID3TagsDTO } from "../../../song/dtos/id3-tags.dto";
import { Song } from "../../../song/entities/song.entity";
import { SongService } from "../../../song/services/song.service";
import { Artist } from "../../../artist/entities/artist.entity";
import { Album } from "../../../album/entities/album.entity";
import { Slug } from "@tsalliance/utilities";
import { DataSource } from "typeorm";
import { ArtistService } from "../../../artist/artist.service";
import { AlbumService } from "../../../album/services/album.service";


export async function read_mp3_tags(pipeline: PipelineRef, step: StepRef, songService: SongService, logger: PipelineLogger) {
    // Prepare step
    const files: File[] = pipeline.read(STAGE_SCAN_ID)?.[STEP_INDEX_FILES_ID]?.files;
    const mount: Mount = pipeline.read(STAGE_SCAN_ID)?.[STEP_CHECKOUT_MOUNT_ID]?.mount;

    if(!files || files.length <= 0) {
        step.skip("No new files were created in database.");
    }

    if(typeof mount === "undefined" || mount == null) {
        step.skip("Invalid mount checked out.")
    }

    const artists: Artist[] = [];
    const albums: Album[] = [];
    const songs: Song[] = [];
    const readFiles: File[] = [];

    return Batch.useDataset<File, File>(files).forEach(async (batch, currentBatch, totalBatches) => {
        const progress = currentBatch / totalBatches;
        step.progress(progress);

        for(const file of batch) {
            // Set mount for file context
            file.mount = mount ?? file.mount;

            // Build filepath
            const filepath = path.resolve(path.join(file.mount.directory, file.directory, file.name));
            logger.info(`Reading ID3 Tags of '${filepath}'`);
            
            // Check if file can be accessed
            const canAccessFile: boolean = await fs.access(filepath).then(() => true).catch((error: Error) => {
                logger.error(`Failed accessing file ${filepath}: ${error?.message}`, error);
                return false;
            });
            // Skip this file if not accessable
            if(!canAccessFile) continue;

            // Read id3 tags from file
            const id3TagsDto: ID3TagsDTO = await songService.readID3TagsFromFile(filepath).catch((error: Error) => {
                logger.error(`Failed reading id3 tags from file ${filepath}: ${error?.message}`, error);
                return null;
            });
            if(typeof id3TagsDto === "undefined" || id3TagsDto == null) continue;

            // Create primary artist
            let primaryArtist: Artist;
            if(id3TagsDto?.artists?.length > 0) {
                const artist = id3TagsDto.artists.splice(0, 1)?.[0];
                primaryArtist = { name: artist?.name } as Artist;
            }

            // Create featured artists
            const featuredArtists: Artist[] = [];
            for(const artistDto of id3TagsDto.artists) {
                featuredArtists.push({ name: artistDto.name } as Artist);
            }

            // Create album
            let album: Album;
            if(id3TagsDto?.album) {
                album = { 
                    name: id3TagsDto.album, 
                    primaryArtist: primaryArtist
                } as Album;
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

            readFiles.push(file);
            songs.push(song);
            if(primaryArtist) artists.push(primaryArtist, ...featuredArtists);
            if(album) albums.push(album);
        }

        return readFiles;
    }).then((readFiles) => {
        step.write("songs", songs);
        step.write("albums", albums);
        step.write("artists", artists);
        logger.info(`Successfully extracted metadata from ${readFiles.length} files: ${songs.length} Songs, ${albums.length} albums, ${artists.length} artists`);
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
export async function create_artists(stage: StageRef, step: StepRef, datasource: DataSource, logger: PipelineLogger) {
    // Prepare step
    const repository = datasource.getRepository(Artist);
    const service = new ArtistService(repository, null);
    const artists: Artist[] = stage.read(STEP_READ_TAGS)?.artists;

    // Check if there are any artists to create them,
    // if not, skip the step
    if(!artists || artists.length <= 0) {
        step.skip("No artists found.");
        return;
    }

    return Batch.useDataset(artists).forEach((batch, currentBatch, totalBatches) => {
        return service.createIfNotExists(batch.map((artist) => {
            // Map slug
            artist.slug = Slug.create(artist.name);
            return artist;
        })).then((createdArtists) => {
            step.progress(currentBatch / totalBatches);
            return createdArtists;
        }).catch((error) => {
            throw error;
        });
    }).then((createdArtists) => {
        logger.info(`Created and fetched ${createdArtists.length} artists.`);
        step.write("artists", createdArtists);
    }).catch((error: Error) => {
        logger.error(`Failed creating artists: ${error.message}`, error);
        throw error;
    });
}

export async function create_albums(stage: StageRef, step: StepRef, datasource: DataSource, logger: PipelineLogger) {
    // Prepare step
    const repository = datasource.getRepository(Album);
    const service = new AlbumService(repository, null, null);
    const artists: Artist[] = stage.read(STEP_SAVE_ARTISTS)?.artists ?? [];
    const albums: Album[] = stage.read(STEP_READ_TAGS)?.albums ?? [];

    // Check if there are any albums to create them,
    // if not, skip the step
    if(!albums || albums.length <= 0) {
        step.skip("No albums found.");
        return;
    }

    return Batch.useDataset(albums).forEach((batch, currentBatch, totalBatches) => {
        // Create database entries
        return service.createIfNotExists(batch.map((album) => {
            // Map artist ids
            const artistId = artists.find((artist) => artist.name.toLowerCase() === album.primaryArtist?.name.toLowerCase())?.id;
            // Map slug
            album.slug = Slug.create(album.name);

            album.primaryArtist = artistId ? { id: artistId } as Artist : undefined;
            return album;
        })).then((createdAlbums) => {
            logger.info(`Created and fetched ${createdAlbums.length} albums.`);
            step.progress(currentBatch / totalBatches);
            return createdAlbums;
        }).catch((error: Error) => {
            logger.error(`Failed creating albums: ${error.message}`, error);
            throw error;
        });
    }).then((createdAlbums) => {
        logger.info(`Created and fetched ${createdAlbums.length} albums.`);
        step.write("albums", createdAlbums);
    }).catch((error: Error) => {
        throw error;
    });
}

export async function create_songs(stage: StageRef, step: StepRef, datasource: DataSource, logger: PipelineLogger) {
    // Prepare step
    const repository = datasource.getRepository(Song);
    const service = new SongService(repository, null, null);
    const artists: Artist[] = stage.read(STEP_SAVE_ARTISTS)?.artists ?? [];
    const albums: Album[] = stage.read(STEP_SAVE_ALBUMS)?.albums ?? [];
    const songs: Song[] = stage.read(STEP_READ_TAGS)?.songs ?? [];

    // Check if there are any albums to create them,
    // if not, skip the step
    if(!songs || songs.length <= 0) {
        step.skip("No songs found.");
        return;
    }

    return Batch.useDataset(songs).forEach((batch, currentBatch, totalBatches) => {
        console.log(currentBatch);

        // Create database entries
        return service.createIfNotExists(batch.map((song) => {
            // Map primaryArtist
            const primaryArtistId: string = artists.find((artist) => artist.name.toLowerCase() === song.primaryArtist?.name?.toLowerCase())?.id;

            // Map album
            const albumId: string = albums.find((album) => album.name.toLowerCase() === song.album?.name?.toLowerCase() && album.primaryArtist?.name.toLowerCase() === song.album?.primaryArtist?.name.toLowerCase())?.id;

            // Map featured artists
            const featuredArtists: Artist[] = [];
            const songFeaturedArtistNames: string[] = song.featuredArtists.map((a) => a.name.toLowerCase());
            for(const artist of artists) {
                if(artist.id === primaryArtistId) continue;
                if(!songFeaturedArtistNames.includes(artist.name.toLowerCase())) continue;
                featuredArtists.push({ id: artist.id } as Artist);
            }

            // Map slug
            song.slug = Slug.create(song.name);
            
            song.primaryArtist = { id: primaryArtistId } as Artist;
            song.album = { id: albumId } as Album;
            song.featuredArtists = featuredArtists;

            console.log(song);

            return song;
        })).then((createdSongs) => {
            step.progress(currentBatch / totalBatches);
            return createdSongs;
        }).catch((error: Error) => {
            logger.error(`Failed creating songs: ${error.message}`, error);
            throw error;
        });
    }).then((createdSongs) => {
        logger.info(`Created and fetched ${createdSongs.length} songs.`);
        step.write("songs", createdSongs);
    }).catch((error: Error) => {
        throw error;
    });
}