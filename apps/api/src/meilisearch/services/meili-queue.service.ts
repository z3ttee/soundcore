import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { WorkerJob, WorkerQueue } from "@soundcore/nest-queue";
import { Album } from "../../album/entities/album.entity";
import { Artist } from "../../artist/entities/artist.entity";
import { EVENT_ALBUMS_CHANGED, EVENT_ARTISTS_CHANGED, EVENT_PLAYLISTS_CHANGED, EVENT_SONGS_CHANGED } from "../../constants";
import { Playlist } from "../../playlist/entities/playlist.entity";
import { Song } from "../../song/entities/song.entity";
import { Environment } from "@soundcore/common";
import { MeiliSyncResultDTO } from "../dtos/meili-sync-result.dto";
import { MeiliJob, MeiliJobType } from "../entities/meili-job.entity";

@Injectable()
export class MeiliQueueService {
    private readonly logger = new Logger(MeiliQueueService.name);

    constructor(
        private readonly queue: WorkerQueue<MeiliJob>
    ) {
        this.queue.on("started", (job: WorkerJob<MeiliJob, MeiliSyncResultDTO>) => {
            this.logger.verbose(`Syncing ${job.payload.resources.length} resources with meilisearch.`);
        });

        this.queue.on("completed", (job: WorkerJob<MeiliJob, MeiliSyncResultDTO>) => {
            this.logger.verbose(`Synced resources with meilisearch. Took ${job.result.timeTookMs}ms.`);
        });

        this.queue.on("failed", (_, error: Error) => {
            this.logger.error(`Failed syncing resources with meilisearch: ${error.message}`, Environment.isDebug ? error.stack : null);
        });
    }

    @OnEvent(EVENT_SONGS_CHANGED)
    public async handleSongsChanged(songs: Song[]) {
        this.syncSongs(songs);
    }

    @OnEvent(EVENT_ARTISTS_CHANGED)
    public async handleArtistsChanged(artists: Artist[]) {
        this.syncArtists(artists);
    }

    @OnEvent(EVENT_ALBUMS_CHANGED)
    public async handleAlbumsChanged(albums: Album[]) {
        this.syncAlbums(albums);
    }

    @OnEvent(EVENT_PLAYLISTS_CHANGED)
    public async handlePlaylistsChanged(playlists: Playlist[]) {
        this.syncPlaylists(playlists);
    }
    
    public async syncSongs(songs: Song[]) {
        const job = new MeiliJob(songs, MeiliJobType.SYNC_SONGS);
        return this.queue.enqueue(job);
    }

    public async syncAlbums(albums: Album[]) {
        const job = new MeiliJob(albums, MeiliJobType.SYNC_ALBUMS);
        return this.queue.enqueue(job);
    }

    public async syncArtists(artists: Artist[]) {
        const job = new MeiliJob(artists, MeiliJobType.SYNC_ARTISTS);
        return this.queue.enqueue(job);
    }

    public async syncPlaylists(playlists: Playlist[]) {
        const job = new MeiliJob(playlists, MeiliJobType.SYNC_PLAYLISTS);
        return this.queue.enqueue(job);
    }

}