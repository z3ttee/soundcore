import MeiliClient from "../../utils/database/meilisearch-worker-client";

import { Logger } from "@nestjs/common";
import { WorkerJobRef } from "@soundcore/nest-queue";
import { Album } from "../../album/entities/album.entity";
import { Artist } from "../../artist/entities/artist.entity";
import { Song } from "../../song/entities/song.entity";
import { Batch } from "@soundcore/common";
import { MeiliSyncResultDTO } from "../dtos/meili-sync-result.dto";
import { MeiliJob, MeiliJobType } from "../entities/meili-job.entity";
import { MeiliAlbumService } from "../services/meili-album.service";
import { MeiliArtistService } from "../services/meili-artist.service";
import { MeiliSongService } from "../services/meili-song.service";
import MeiliSearch, { TaskStatus } from "meilisearch";
import Database from "../../utils/database/database-worker-client";
import { SongService } from "../../song/song.service";
import { SyncFlag } from "../interfaces/syncable.interface";
import { Environment } from "@soundcore/common";
import { ArtistService } from "../../artist/artist.service";
import { DataSource } from "typeorm";
import { AlbumService } from "../../album/album.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Playlist } from "../../playlist/entities/playlist.entity";
import { MeiliPlaylistService } from "../services/meili-playlist.service";
import { PlaylistService } from "../../playlist/playlist.service";
import { PlaylistItem } from "../../playlist/entities/playlist-item.entity";

const logger = new Logger("MeiliSync");

export default async function (job: WorkerJobRef<MeiliJob>): Promise<MeiliSyncResultDTO> {
    const startTime = Date.now();

    return Database.connect().then((datasource) => {
        return MeiliClient.connect().then(async (meilisearch) => {
            const { payload } = job;
    
            if(payload.type == MeiliJobType.SYNC_SONGS) {
                await syncSongs(datasource, meilisearch, job.payload.resources as Song[]);
            } else if(payload.type == MeiliJobType.SYNC_ALBUMS) {
                await syncAlbums(datasource, meilisearch, job.payload.resources as Album[]);
            } else if(payload.type == MeiliJobType.SYNC_ARTISTS) {
                await syncArtists(datasource, meilisearch, job.payload.resources as Artist[]);
            } else if(payload.type == MeiliJobType.SYNC_PLAYLISTS) {
                await syncPlaylists(datasource, meilisearch, job.payload.resources as Playlist[]);
            } else {
                throw new Error("Failed handling meilisearch sync task: Invalid Sync Type");
            }
            
            return new MeiliSyncResultDTO(Date.now() - startTime);
        });
    });
}

async function syncSongs(datasource: DataSource, client: MeiliSearch, resources: Song[]): Promise<any> {
    const service = new MeiliSongService(client);
    const songService = new SongService(datasource.getRepository(Song), new EventEmitter2(), service);
    
    return Batch.of<Song>(resources).do((batch) => {
        return service.setSongs(batch).then((task) => {
            return songService.setLastSyncedDetails(batch, SyncFlag.OK).then((result) => {
                return batch;
            });
        }).catch((error: Error) => {
            songService.setLastSyncedDetails(resources, SyncFlag.ERROR);
            logger.error(`Could not sync songs with meilisearch: ${error.message}`, Environment.isDebug ? error.stack : null);
            throw error;
        });
    }).start();
}

async function syncAlbums(datasource: DataSource, client: MeiliSearch, resources: Album[]): Promise<any> {
    const eventEmitter = new EventEmitter2();
    const service = new MeiliAlbumService(client);
    const albumService = new AlbumService(datasource.getRepository(Album), eventEmitter, service);
    
    return Batch.of<Album>(resources).do((batch) => {
        return service.setAlbums(batch).then((task) => {
            return albumService.setLastSyncedDetails(batch, SyncFlag.OK).then((result) => {
                return batch;
            });
        }).catch((error: Error) => {
            albumService.setLastSyncedDetails(resources, SyncFlag.ERROR);
            logger.error(`Could not sync albums with meilisearch: ${error.message}`, Environment.isDebug ? error.stack : null);
            throw error;
        });
    }).start();
}

async function syncArtists(datasource: DataSource, client: MeiliSearch, resources: Artist[]): Promise<any> {
    const service = new MeiliArtistService(client);
    const artistService = new ArtistService(datasource.getRepository(Artist), service);
    
    return Batch.of<Artist>(resources).do((batch) => {
        return service.setArtists(batch).then((task) => {
            return artistService.setLastSyncedDetails(batch, SyncFlag.OK).then((result) => {
                return batch;
            });
        }).catch((error: Error) => {
            artistService.setLastSyncedDetails(resources, SyncFlag.ERROR);
            logger.error(`Could not sync artists with meilisearch: ${error.message}`, Environment.isDebug ? error.stack : null);
            throw error;
        });
    }).start();
}

async function syncPlaylists(datasource: DataSource, client: MeiliSearch, resources: Playlist[]): Promise<any> {
    const service = new MeiliPlaylistService(client);
    const playlistService = new PlaylistService(service, new EventEmitter2(), datasource.getRepository(Playlist), datasource.getRepository(PlaylistItem));
    
    return Batch.of<Playlist>(resources).do((batch) => {
        return service.setPlaylists(batch).then((task) => {
            return playlistService.setLastSyncedDetails(batch, SyncFlag.OK).then((result) => {
                return batch;
            });
        }).catch((error: Error) => {
            playlistService.setLastSyncedDetails(resources, SyncFlag.ERROR);
            logger.error(`Could not sync playlists with meilisearch: ${error.message}`, Environment.isDebug ? error.stack : null);
            throw error;
        });
    }).start();
}