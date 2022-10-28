import { OnQueueActive, OnQueueCompleted, OnQueueFailed, OnQueueProgress, Process, Processor } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { Random } from "@tsalliance/utilities";
import { Job } from "bull";
import { PlaylistPrivacy } from "../../playlist/enums/playlist-privacy.enum";
import { PlaylistService } from "../../playlist/playlist.service";
import { SongService } from "../../song/song.service";
import { SpotifyBullJob, SpotifySong } from "../entities/spotify-song.entity";
import { SpotifyService } from "../spotify/spotify.service";

interface SpotifyImportResult {
    time: number;
    status?: "ok" | "failed";
}

@Processor("import-spotify-queue")
export class SpotifyConsumer {
    private logger: Logger = new Logger(SpotifyConsumer.name)

    constructor(
        private spotifyService: SpotifyService,
        private playlistService: PlaylistService,
        private songService: SongService
    ) {}

    @Process()
    public async importSpotifyPlaylist(job: Job<SpotifyBullJob>) {
        const start = Date.now();
        const spotifyPlaylist = job.data.playlist;
        const importer = job.data.importer;

        if(await this.playlistService.existsByTitleInUser(spotifyPlaylist.name, importer.id)) {
            spotifyPlaylist.name = spotifyPlaylist.name + "-" + Random.randomString(4);
        }

        const playlist = await this.playlistService.create({ title: spotifyPlaylist.name, privacy: PlaylistPrivacy.PUBLIC }, importer);
        job.data.resultPlaylist = playlist;
        job.update(job.data);

        let nextUrl: string = undefined;
        while (true) {
            // Get page of spotify songs. If length is 0, it means there are no items
            // At this point the while loop has to be breaked.
            const tracks = await this.spotifyService.findSpotifyPlaylistTracks(spotifyPlaylist.id, nextUrl);
            if((tracks?.items?.length || 0) <= 0) break;

            nextUrl = tracks.next;
            const songIds: string[] = [];
            const notFound: SpotifySong[] = []

            // Go through retrieved SpotifySongs and map them to
            // songs on Soundcore
            const length = tracks.items.length;
            let x = 0;
            while(x < length) {
                const track = tracks.items[x].track;
                const artists: string[] = track.artists?.map((artist) => artist.name) || [];
                const song = await this.songService.findByTitleAndArtists(track.name, artists);

                if(!song) notFound.push(track);
                else songIds.push(song.id)
                x++;
            }

            // Add songs to playlist
            // await this.playlistService.addSongs(playlist.id, songIds, importer);

            // Update job so it does not get into stalled state
            job.update(job.data);
            if(!tracks?.next) break;
        }
        
        return { time: Date.now() - start, status: "ok" }
    }

    @OnQueueActive()
    public async onActive(job: Job<SpotifyBullJob>) {
        // TODO: Send update via socket
        this.logger.verbose(`Now importing spotify playlist '${job.data.playlist.name}'...`)
    }

    @OnQueueFailed()
    public async onFailed(job: Job<SpotifyBullJob>, error: Error) {
        // TODO: Send update via socket
        this.logger.error(`Failed importing spotify playlist '${job.data.playlist.name}': ${error.message}`);
    }

    @OnQueueCompleted()
    public async onComplete(job: Job<SpotifyBullJob>, result: SpotifyImportResult) {
        // TODO: Send update via socket
        this.logger.verbose(`Imported spotify playlist '${job.data.playlist.name}' in ${result.time}ms.`)
    }

    @OnQueueProgress()
    public async onProgress(job: Job<SpotifyBullJob>) {
        // TODO: Push created playlist to socket
    }

}