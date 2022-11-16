import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import axios, { AxiosError } from "axios";
import { User } from "../../user/entities/user.entity";
import { CreateImportDTO } from "../dtos/create-import.dto";
import { ImportTask, ImportTaskType } from "../entities/import.entity";
import { SpotifyClientAccessToken, SpotifyPlaylist, SpotifyTrackList } from "../entities/spotify-song.entity";
import { ImportService } from "./import.service";

@Injectable()
export class SpotifyImportService {
    private logger: Logger = new Logger(SpotifyImportService.name)

    private token: SpotifyClientAccessToken;
    private tokenExpiresAt: number;

    private readonly spotifyBaseUrls: string[] = [
        "https://open.spotify.com/playlist/"
    ];

    constructor(
        private readonly importService: ImportService
    ) {}

    /**
     * Find a task that belongs to specific user and 
     * has an url.
     * @param userId User's id
     * @param url URL to lookup
     * @returns ImportTask
     */
    public async findByUserIdAndUrl(userId: string, url: string): Promise<ImportTask> {
        return this.importService.getRepository().createQueryBuilder("task")
            .leftJoinAndSelect("task.user", "user")
            .where("user.id = :userId AND task.url = :url", { userId, url })
            .getOne();
    }

    /**
     * Create a new import for spotify playlist urls.
     * @param createImportDto DTO for creation data exchange
     * @param authentication Authentication object of the request
     * @returns ImportTask
     */
    public async createPlaylistImport(createImportDto: CreateImportDTO, authentication: User): Promise<ImportTask> {
        // Check if url might be safe by checking its base
        let isUrlSafe: boolean = false;
        for(const baseUrl of this.spotifyBaseUrls) {
            if(createImportDto.url.startsWith(baseUrl)) {
                isUrlSafe = true;
                break;
            }
        }

        // Check the result from above 
        if(!isUrlSafe) {
            throw new BadRequestException("Invalid Spotify playlist url.");
        }

        // Check for possible duplicate import task
        if(!!await this.findByUserIdAndUrl(authentication.id, createImportDto.url)) {
            throw new BadRequestException("Import task for that url already exists.");
        }

        // Create import task entity
        const task = new ImportTask();
        task.user = authentication;
        task.type = ImportTaskType.SPOTIFY_PLAYLIST;
        task.url = createImportDto.url;
        task.privacy = createImportDto.privacy;

        // Save entity and return it
        return this.importService.createIfNotExists(task);
    }

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
                return null;
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