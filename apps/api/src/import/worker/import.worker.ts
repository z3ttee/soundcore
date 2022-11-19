import { InternalServerErrorException } from "@nestjs/common";
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
import MeiliClient from "../../utils/database/meilisearch-worker-client";
import { SpotifyClient } from "../clients/spotify.client";
import { ImportTask, ImportTaskType } from "../entities/import.entity";
import { SpotifySong, SpotifyTrackList } from "../entities/spotify-song.entity";

export default async function (job: WorkerJobRef<ImportTask>): Promise<any> {
    const taskType = job.payload.type;

    if(taskType == ImportTaskType.SPOTIFY_PLAYLIST) {
        return importSpotifyPlaylist(job);
    } else {
        throw new InternalServerErrorException("Received import task with invalid type.");
    } 

    // https://open.spotify.com/playlist/1m1n3D4q1PXSmaqQBS5rK7?si=16545a9d58314b9c
}

async function importSpotifyPlaylist(job: WorkerJobRef<ImportTask>): Promise<any> {
    const client = SpotifyClient.getInstance();

    // TODO: Better logging
    
    return Database.connect().then((datasource) => {
        return MeiliClient.connect().then((meilisearch) => {
            if(!client.isEnabled) {
                throw new InternalServerErrorException("Spotify module is disabled");
            }

            const eventEmitter = new EventEmitter2()
    
            const songRepo = datasource.getRepository(Song);
            const playlistRepo = datasource.getRepository(Playlist);
            const song2playlistRepo = datasource.getRepository(PlaylistItem);

            const songService = new SongService(songRepo, eventEmitter, new MeiliSongService(meilisearch));
            const playlistService = new PlaylistService(playlistRepo, song2playlistRepo, eventEmitter, new MeiliPlaylistService(meilisearch));
            
            const { payload } = job;
            const task = payload;
            const user = payload.user;
            const baseUrl = task.baseUrl;
        
            const url = new URL(task.url + "/", baseUrl);
            
            const playlistId = url.pathname.replace("/playlist/", "");

            // Fetch playlist from spotify
            return client.findSpotifyPlaylistById(playlistId).then(async (spotifyPlaylist) => {
        
                const foundSpotifySongs: Song[] = [];
                const notFoundSongs: SpotifySong[] = [];
        
                let nextUrl: string = undefined;
                while(true) {
                    // Fetch tracklist from spotify api
                    const tracklist: SpotifyTrackList = await client.findSpotifyPlaylistTracks(playlistId, nextUrl).then((val) => val).catch((error: Error) => {
                        throw new InternalServerErrorException("Spotify error: " + error.message)
                    });
        
                    // Save nextUrl for next iteration
                    nextUrl = tracklist.next;

                    const names: string[] = [];
                    const artistNames: string[] = [];
                    const albumNames: string[] = [];
        
                    // Collect songs and push to found array
                    for(let i = 0; i < tracklist.items.length; i++) {
                        const item = tracklist.items[i];
                        const track = item.track;

                        names.push(track.name);
                        artistNames.push(...track.artists.map((artist) => artist.name));
                        if(track.album?.name) albumNames.push(track.album?.name);
                    }

                    // Find songs by names, artists and album names
                    const songs = await songService.findByNamesAndArtistsAndAlbums(names, artistNames, albumNames).catch((error: Error) => {
                        throw new InternalServerErrorException("Error while accessing database.");
                    });

                    // Push to results
                    foundSpotifySongs.push(...songs);

                    // Was last page, so the loop can be broken
                    if(!tracklist.next) break;
                }

                // Create playlist in soundcore database
                const playlist = await playlistService.create({
                    title: spotifyPlaylist.name,
                    description: spotifyPlaylist.description,
                    privacy: task.privacy
                }, user).catch((error: Error) => {
                    throw new InternalServerErrorException("Could not create playlist.");
                });

                // Add songs to the playlist
                return Batch.of<Song, any>(foundSpotifySongs, 20).do(async (batch) => {

                    await playlistService.setSongs(playlist.id, batch, user).catch((error: Error) => {
                        console.log("could not add songs to playlist: ");
                        console.error(error);
                    });

                    return [];
                }).start().then(() => {
                    // TODO: Return result of worker here
                    console.log("added songs to playlist")
                }).catch((error: Error) => {
                    throw new InternalServerErrorException("Failed adding songs to playlist");
                });
            });
        });
    });
}