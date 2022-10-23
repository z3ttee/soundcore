import MeiliClient from "../../utils/database/meilisearch-worker-client";

import { Logger } from "@nestjs/common";
import { WorkerJobRef } from "@soundcore/nest-queue";
import { Album } from "../../album/entities/album.entity";
import { Artist } from "../../artist/entities/artist.entity";
import { Song } from "../../song/entities/song.entity";
import { Batching } from "../../utils/batching";
import { MeiliSyncResultDTO } from "../dtos/meili-sync-result.dto";
import { MeiliJob, MeiliJobType } from "../entities/meili-job.entity";
import { MeiliAlbumService } from "../services/meili-album.service";
import { MeiliArtistService } from "../services/meili-artist.service";
import { MeiliSongService } from "../services/meili-song.service";
import MeiliSearch, { TaskStatus } from "meilisearch";
import Database from "../../utils/database/database-worker-client";
import { SongService } from "../../song/song.service";
import { SyncFlag } from "../interfaces/syncable.interface";
import Debug from "../../utils/environment";

const logger = new Logger("MeiliSync");

export default async function (job: WorkerJobRef<MeiliJob>): Promise<MeiliSyncResultDTO> {
    const startTime = Date.now();

    return Database.connect().then((datasource) => {
        return MeiliClient.connect().then(async (meilisearch) => {
            const { payload } = job;
    
            if(payload.type == MeiliJobType.SYNC_SONGS) {
                await syncSongs(datasource, meilisearch, job.payload.resources as Song[]);
            } else if(payload.type == MeiliJobType.SYNC_ALBUMS) {
                await syncAlbums(meilisearch, job.payload.resources as Album[]);
            } else if(payload.type == MeiliJobType.SYNC_ARTISTS) {
                await syncArtists(meilisearch, job.payload.resources as Artist[]);
            } else {
                throw new Error("Failed handling meilisearch sync task: Invalid Sync Type");
            }
            
            return new MeiliSyncResultDTO(Date.now() - startTime);
        });
    });
}

async function syncSongs(datasource, client: MeiliSearch, resources: Song[]): Promise<any> {
    const service = new MeiliSongService(client);
    const songService = new SongService(datasource.getRepository(Song), service);
    
    return Batching.of<Song>(resources).do((batch) => {
        return service.setSongs(batch).then((task) => {

            // client.waitForTask(task.uid, { timeOutMs: 10 }).then((task) => {
            //     if(task.status == "failed") {
            //         throw new Error("Meilisearch failed processing the task.");
            //     }

            //     console.log(task);
            // }).catch((error: Error) => {
            //     console.error(error);
            // })

            return songService.setLastSyncedDetails(batch, SyncFlag.OK).then((result) => {
                return batch;
            });
        }).catch((error: Error) => {
            songService.setLastSyncedDetails(resources, SyncFlag.ERROR);
            logger.error(`Could not sync songs with meilisearch: ${error.message}`, Debug.isDebug ? error.stack : null);
            throw error;
        });
    }).start();
}

async function syncAlbums(client: MeiliSearch, resources: Album[]): Promise<any> {
    const service = new MeiliAlbumService(client);
    
    return Batching.of<Album>(resources).do((batch) => {
        service.setAlbums(batch);
        return batch;
    }).start();
}

async function syncArtists(client: MeiliSearch, resources: Artist[]): Promise<any> {
    const service = new MeiliArtistService(client);
    
    return Batching.of<Artist>(resources).do((batch) => {
        service.setArtists(batch);
        return batch;
    }).start();
}