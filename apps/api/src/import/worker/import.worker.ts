import { InternalServerErrorException, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Batch } from "@soundcore/common";
import { WorkerJobRef } from "@soundcore/nest-queue";
import { MeiliPlaylistService } from "../../meilisearch/services/meili-playlist.service";
import { MeiliSongService } from "../../meilisearch/services/meili-song.service";
import { PlaylistItem } from "../../playlist/entities/playlist-item.entity";
import { Playlist } from "../../playlist/entities/playlist.entity";
import { PlaylistService } from "../../playlist/playlist.service";
import { Song } from "../../song/entities/song.entity";
import { SongService } from "../../song/services/song.service";
import Database from "../../utils/database/database-worker-client";
import MeilisearchClient from "../../utils/database/meilisearch-worker-client";
import { ImportTask, ImportTaskStatus, ImportTaskType } from "../entities/import.entity";
import { SpotifySong, SpotifyTrackList } from "../clients/spotify/spotify-entities";
import { ImportService } from "../services/import.service";
import { SpotifyClient } from "../clients/spotify/spotify.client";
import { FailedReason, FailedSpotifyImport, ImportSpotifyReport, ImportSpotifyResult, ImportSpotifyStats, SpotifyImport } from "../entities/spotify-import.entity";
import { ImportReport } from "../entities/import-report.entity";
import { ImportReportService } from "../services/import-report.service";

export default async function (job: WorkerJobRef<ImportTask>): Promise<any> {
    const taskType = job.payload.type;

    if(taskType == ImportTaskType.SPOTIFY_PLAYLIST) {
        return importSpotifyPlaylist(job);
    } else {
        throw new InternalServerErrorException("Received import task with invalid type.");
    } 

    // https://open.spotify.com/playlist/1m1n3D4q1PXSmaqQBS5rK7?si=16545a9d58314b9c
}

async function importSpotifyPlaylist(job: WorkerJobRef<ImportTask>): Promise<ImportSpotifyResult> {
    const client = SpotifyClient.getInstance();

    // Just for logging and stats
    const logger = new Logger()
    const startedAtMs = Date.now();
    
    // Connect the database client
    return Database.connect().then((datasource) => {
        // Create new meilisearch instance
        return MeilisearchClient.connect().then((meilisearch) => {

            // Check if spotify module is enabled
            if(!client.isEnabled) {
                throw new InternalServerErrorException("Spotify module is disabled");
            }

            // Create new event emitter required by services
            const eventEmitter = new EventEmitter2()

            // Instantiate meilisearch client for playlist syncing
            const meiliPlaylistClient = new MeiliPlaylistService(meilisearch);
    
            // Instantiate repositories used by the services
            const songRepo = datasource.getRepository(Song);
            const playlistRepo = datasource.getRepository(Playlist);
            const song2playlistRepo = datasource.getRepository(PlaylistItem);
            const importRepo = datasource.getRepository(ImportTask);
            const reportRepo = datasource.getRepository(ImportReport);

            // Instantiate services
            const songService = new SongService(songRepo, new MeiliSongService(meilisearch));
            const playlistService = new PlaylistService(playlistRepo, song2playlistRepo, eventEmitter, meiliPlaylistClient);
            const importService = new ImportService(importRepo);
            const reportService = new ImportReportService(reportRepo);
            
            // Destructure job object into payload
            // and make variables of most used data
            const { payload } = job;
            const task = payload as SpotifyImport;
            const user = payload.user;
            const baseUrl = task.baseUrl;
        
            // Extract playlist id from the url
            const url = new URL(task.url + "/", baseUrl);
            const playlistId = url.pathname.replace("/playlist/", "");

            // Fetch playlist from spotify
            return client.findSpotifyPlaylistById(playlistId).then(async (spotifyPlaylist) => {
        
                // Array of songs that were extracted from the spotify playlist
                const extractedSongs: Song[] = [];
                const notExtractedSpotifySongs: FailedSpotifyImport[] = [];
                
                // Used to track how many total songs are in the playlist on spotify
                let totalSpotifyTracks: number = 0;
        
                let nextUrl: string = undefined;
                while(true) {
                    // Array of songs that were found in spotify playlist
                    const availableSpotifySongs: Map<string, SpotifySong> = new Map();

                    // Fetch tracklist from spotify api
                    const tracklist: SpotifyTrackList = await client.findSpotifyPlaylistTracks(playlistId, nextUrl).then((val) => val).catch((error: Error) => {
                        throw new InternalServerErrorException("Spotify error: " + error.message)
                    });

                    // Increments stats
                    totalSpotifyTracks += tracklist.items.length;
        
                    // Save nextUrl for next iteration
                    nextUrl = tracklist.next;

                    const names: string[] = [];
                    const artistNames: string[] = [];
                    const albumNames: string[] = [];
        
                    // Collect songs and push to found array
                    for(let i = 0; i < tracklist.items.length; i++) {
                        const item = tracklist.items[i];
                        const track = item.track;

                        // Split data up into song names, artists and album names
                        // This is later used to lookup matching songs on soundcore
                        names.push(track.name);
                        artistNames.push(...track.artists.map((artist) => artist.name));
                        if(track.album?.name) albumNames.push(track.album?.name);

                        // Save spotify song with key
                        availableSpotifySongs.set(getSpotifySongKey(track), track)
                    }

                    // Find songs by names, artists and album names
                    const songs = await songService.findByNamesAndArtistsAndAlbums(names, artistNames, albumNames).catch((error: Error) => {
                        throw new InternalServerErrorException("Error while accessing database.");
                    });

                    // Map found songs in soundcore database to their keys
                    const foundSongsMappedToKey = songs.reduce((map, song) => {
                        const key = getSpotifySongKey({ name: song.name, album: song.album });
                        map.set(key, true);

                        return map;
                    }, new Map<string, boolean>());

                    // Filter which spotifySongs were not found
                    const notFoundSpotifySongs: FailedSpotifyImport[] = Array.from(availableSpotifySongs.values()).filter((spotifySong) => {
                        return !foundSongsMappedToKey.has(getSpotifySongKey(spotifySong));
                    }).map((song) => ({
                        id: song.id,
                        title: song.name,
                        album: song.album?.name,
                        artists: song.artists?.map((a) => a.name),
                        reason: FailedReason.NOT_FOUND
                    }));

                    // Push to results
                    notExtractedSpotifySongs.push(...notFoundSpotifySongs);
                    extractedSongs.push(...songs);

                    // Was last page, so the loop can be broken
                    if(!tracklist.next) break;
                }

                // Create playlist in soundcore database
                const playlist = await playlistService.createIfNotExists({
                    title: spotifyPlaylist.name,
                    description: spotifyPlaylist.description,
                    privacy: task.privacy
                }, user).catch((error: Error) => {
                    logger.error(`Could not create playlist via spotify import: ${error.message}`, error.stack);
                    throw new InternalServerErrorException("Could not create playlist.");
                });

                // Used to track how many of the found songs
                // were added to the playlist
                let totalSongsImported = 0;
                const notImportedSongs: FailedSpotifyImport[] = [];

                // Add songs to the playlist
                // return Batch.of<Song, any>(extractedSongs, 20).do(async (batch) => {

                //     await playlistService.setSongs(playlist.id, batch, user).then((insertResult) => {
                //         // Increment stats
                //         totalSongsImported += insertResult.identifiers.length;
                //     }).catch((error: Error) => {
                //         logger.error(`Failed adding songs to imported playlist: ${error.message}`, error.stack);
                //         notImportedSongs.push(...batch.map((song) => ({
                //             title: song.name,
                //             album: song.album?.name,
                //             artists: [ song.primaryArtist?.name, ...song.featuredArtists?.map((artist) => artist.name) ],
                //             reason: FailedReason.ERROR
                //         } as FailedSpotifyImport)))
                //     });

                //     return [];
                // }).start().then(() => {
                //     const endedAtMs = Date.now();
                //     const timeTookMs: number = endedAtMs - startedAtMs;

                //     // Create stats for reporting
                //     const stats: ImportSpotifyStats = {
                //         total: totalSpotifyTracks,
                //         importedAmount: totalSongsImported,
                //         timeTookMs
                //     }

                //     // Create result object that is returned by the worker
                //     const result = new ImportSpotifyResult(playlist, ImportTaskStatus.OK, stats);

                //     return reportService.createIfNotExistsForTask(task, {
                //         notImportedSongs: notExtractedSpotifySongs
                //     } as ImportSpotifyReport).catch((error: Error) => {
                //         logger.warn(`Failed creating report for import task: ${error.message}`);
                //         return null;
                //     }).then((report) => {
                //         // Update payload in database
                //         return importService.setTaskPayload(task, playlist).then(() => {
                //             // Update stats in database
                //             return importService.setTaskStats(task, stats).then(() => {
                //                 // Return result created above
                //                 return result;
                //             });
                //         });
                //     });
                // }).catch((error: Error) => {
                //     logger.error(`Failed batch-import of songs for imported playlist: ${error.message}`);
                //     throw new InternalServerErrorException("Failed adding songs to playlist");
                // });
                return null;
            });
        });
    });
}

function getSpotifySongKey(spotifySong: Partial<SpotifySong>): string {
    // return `${spotifySong.name}:${spotifySong.album?.name}:${spotifySong.artists.map((artist) => artist.name).join("-")}`;
    return `${spotifySong?.name}:${spotifySong?.album?.name}`;
}