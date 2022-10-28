import { InjectQueue } from "@nestjs/bull";
import { Injectable, Logger } from "@nestjs/common";
import axios, { AxiosError } from "axios";
import { Queue } from "bull";
import { User } from "../../user/entities/user.entity";
import { SpotifyBullJob, SpotifyClientAccessToken, SpotifyPlaylist, SpotifyTrackList } from "../entities/spotify-song.entity";

@Injectable()
export class SpotifyService {
    private logger: Logger = new Logger(SpotifyService.name)

    private token: SpotifyClientAccessToken;
    private tokenExpiresAt: number;

    constructor(
        @InjectQueue("import-spotify-queue") private spotifyQueue: Queue<SpotifyBullJob>
    ) {}

    /**
     * Get the access token of the current client.
     * If the token does not exist or has expired, then a new one
     * is fetched automatically.
     * @returns SpotifyClientAccessToken
     */
    public async authorizeClient(): Promise<SpotifyClientAccessToken> {
        // Check if token is still valid.
        if(this.isTokenValid()) {
            this.logger.debug("Spotify Client token still valid. Using it...")
            return this.token;
        } 

        // Otherwise request new access token using client_id and client_secret
        return axios.post(`https://accounts.spotify.com/api/token`, "grant_type=client_credentials", { 
            headers: {
                "Authorization": `Basic ${ Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64") }`
            }            
        }).then((response) => {
            if(response.data && response.status == 200) {
                const token = new SpotifyClientAccessToken();
                token.access_token = response.data["access_token"]
                token.expires_in = response.data["expires_in"]
                token.token_type = response.data["token_type"]

                // Update token and return it.
                this.setToken(token);
                return this.token;
            }
        }).catch((error: AxiosError) => {
            this.logger.error(error);
            this.setToken(null);
            return null;
        })
    }

    public async findSpotifyPlaylistById(playlistId: string, user: User): Promise<SpotifyPlaylist> {
        return this.authorizeClient().then((token) => {
            return axios.get(`https://api.spotify.com/v1/playlists/${playlistId}`, {
                headers: {
                    "Authorization": `Bearer ${token.access_token}`,
                    "Content-Type": "application/json"
                }
            }).then((response) => {
                const data = response.data as SpotifyPlaylist;
                const playlist = new SpotifyPlaylist()
                playlist.id = data.id;
                playlist.description = data.description;
                playlist.tracks = null;
                playlist.type = data.type;
                playlist.uri = data.uri;
                playlist.name = data.name;

                if(data.images?.[0]) playlist.images = [ data.images[0] ];

                // Add to queue
                return this.spotifyQueue.add({
                    importer: user,
                    playlist: playlist
                }).then(() => {
                    return playlist;
                }).catch((error) => {
                    throw error;
                })
            })
        }).catch((error: Error) => {
            this.logger.error(error);
            throw error
        })
    }

    public async findSpotifyPlaylistTracks(playlistId: string, nextUrl?: string): Promise<SpotifyTrackList> {
        return this.authorizeClient().then((token) => {
            return axios.get(nextUrl || `https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                headers: {
                    "Authorization": `Bearer ${token.access_token}`,
                    "Content-Type": "application/json"
                }
            }).then((response) => {
                const data = response.data as SpotifyTrackList;
                return data;
            })
        }).catch((error: Error) => {
            this.logger.error(error);
            throw error
        })
    }

    /**
     * Update current token to a new one.
     * @param token Token to set
     * @returns SpotifyClientAccessToken
     */
    private setToken(token: SpotifyClientAccessToken): SpotifyClientAccessToken {
        if(!token) {
            this.token = null;
            return;
        }

        this.token = token;
        this.tokenExpiresAt = Date.now() + token.expires_in * 1000;
        return this.token;
    }

    /**
     * Check if the current token is still valid.
     * @returns True or False
     */
    private isTokenValid(): boolean {
        return !!this.token && Date.now() < this.tokenExpiresAt;
    }

}