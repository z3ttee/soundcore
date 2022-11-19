import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import axios, { AxiosError } from "axios";
import { User } from "../../user/entities/user.entity";
import { CreateImportDTO } from "../dtos/create-import.dto";
import { ImportTask, ImportTaskType } from "../entities/import.entity";
import { SpotifyClientAccessToken, SpotifyPlaylist, SpotifyTrackList } from "../entities/spotify-song.entity";
import { ImportQueueService } from "./import-queue.service";
import { ImportService } from "./import.service";

@Injectable()
export class SpotifyImportService {
    private logger: Logger = new Logger(SpotifyImportService.name)

    private readonly spotifyBaseUrls: string[] = [
        "https://open.spotify.com/playlist/"
    ];

    constructor(
        private readonly queueService: ImportQueueService,
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
        let usedBaseUrl: string = null;
        for(const baseUrl of this.spotifyBaseUrls) {
            if(createImportDto.url.startsWith(baseUrl)) {
                isUrlSafe = true;
                usedBaseUrl = baseUrl;
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
        task.baseUrl = usedBaseUrl;
        task.url = createImportDto.url;
        task.privacy = createImportDto.privacy;

        // Save entity and return it
        return this.importService.createIfNotExists(task).then((result) => {
            this.queueService.enqueueTask(result);
            return result;
        });
    }

}