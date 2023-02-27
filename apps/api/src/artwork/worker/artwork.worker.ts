import { InternalServerErrorException } from "@nestjs/common";
import { Batch } from "@soundcore/common";
import { WorkerJobRef } from "@soundcore/nest-queue";
import { FileSystemService } from "../../filesystem/services/filesystem.service";
import { Song } from "../../song/entities/song.entity";
import { SongService } from "../../song/services/song.service";
import Database from "../../utils/database/database-worker-client";
import { ArtworkProcessResultDTO } from "../dtos/artwork-process-result.dto";
import { ArtworkProcessDTO, ArtworkProcessFlag, ArtworkSourceType } from "../dtos/artwork-process.dto";
import { Artwork, ArtworkFlag, ArtworkID } from "../entities/artwork.entity";
import { ArtworkService } from "../services/artwork.service";

export default async function (job: WorkerJobRef<ArtworkProcessDTO>): Promise<ArtworkProcessResultDTO> {
    const { sourceType, flag } = job.payload;

    if(flag == ArtworkProcessFlag.CONTINUE_PROCESSING) {
        return continueProcessing(job);
    }

    if(sourceType == ArtworkSourceType.SONG) {
        const payload = job.payload as ArtworkProcessDTO<string>
        return createFromSong(payload.entities);
    } else if(sourceType == ArtworkSourceType.URL) {
        const payload = job.payload as ArtworkProcessDTO<string>
        return createFromUrl(payload.entities);
    } else {
        throw new Error(`Received artwork process task with invalid source type. Received ${sourceType}, expected one of [${Object.values(ArtworkSourceType).join(", ")}]`);
    }
}

async function createFromSong(artworkIds: string[]): Promise<ArtworkProcessResultDTO> {
    return Database.connect().then(async (datasource) => {
        const startedAtMs = Date.now();
        const fsService = new FileSystemService();

        const artworkRepo = datasource.getRepository(Artwork);
        const songRepo = datasource.getRepository(Song);

        const artworkService = new ArtworkService(artworkRepo, fsService);
        const songService = new SongService(songRepo, null);

        // return Batch.of(artworkIds, 10).do(async (batch) => {
        //     const songs = await songService.findByArtworkIds(batch).catch((err) => {
        //         console.error(err)
        //         return [];
        //     });

        //     const succeededArtworks: string[] = [];
        //     const erroredArtworks: string[] = [];

        //     const succeededArtworkEntities: Artwork[] = [];

        //     for(const song of songs) {
        //         const file = song.file;
        //         const filepath = fsService.resolveFilepath(file);

        //         if(typeof file === "undefined" || file == null) {
        //             throw new InternalServerErrorException(`Could not find file entity on song object.`);
        //         }

        //         const tags = await songService.readID3TagsFromFile(filepath);
        //         const buffer = tags.cover;

        //         await artworkService.writeFromBufferOrFile(buffer, song.artwork).then(async (artwork) => {
        //             // TODO: Better logging
        //             const color = await artworkService.extractAccentColor(artwork).catch((error: Error) => {
        //                 console.error(error);
        //                 return null;
        //             });

        //             artwork.accentColor = color ?? artwork.accentColor;
        //             artwork.flag = ArtworkFlag.OK;

        //             succeededArtworks.push(artwork.id);
        //             succeededArtworkEntities.push(artwork);
        //         }).catch((error: Error) => {
        //             erroredArtworks.push(song.artwork.id);
        //             console.error(error);
        //             throw new InternalServerErrorException(`Failed writing artwork to file ${filepath}: ${error.message}`, error.stack);
        //         });
        //     }
                    
        //     return artworkService.setFlags([...erroredArtworks], ArtworkFlag.ERROR).then(() => {
        //         // TODO: Set flags and update accentColor with just one query
        //         // return artworkService.setFlags(succeededArtworks, ArtworkFlag.OK).then((updated) => {
        //         //     return batch;
        //         // });
        //         // Because artwork flag and color are updated above, we save it using this function
        //         return artworkService.saveAll(succeededArtworkEntities).then(() => {
        //             return batch;
        //         })
        //     });
        // }).catch(async (_, error: Error) => {
        //     await artworkService.setFlags(artworkIds, ArtworkFlag.ERROR);
        //     throw error;
        // }).start().then((value): ArtworkProcessResultDTO => {
        //     return {
        //         artworks: value,
        //         timeTookMs: Date.now() - startedAtMs
        //     }
        // });
        return null;
    });
}

async function createFromUrl(artworkIds: string[]): Promise<ArtworkProcessResultDTO> {
    //const url = job.payload.source.data;
    return null;
}

async function continueProcessing(job: WorkerJobRef<ArtworkProcessDTO>): Promise<ArtworkProcessResultDTO> {
    return Database.connect().then(async (datasource) => {
        // 1. Fetch artworks with awaiting flags that have source type song

        // 2. Process those artworks using the existing function for songs

        const startedAtMs = Date.now();
        const fsService = new FileSystemService();

        const artworkRepo = datasource.getRepository(Artwork);
        const artworkService = new ArtworkService(artworkRepo, fsService);
        const processResult: ArtworkProcessResultDTO = {
            artworks: [],
            timeTookMs: -1
        };

        /**
         * Do for artworks that are sourced from a song
         */
        const songArtworkIds: string[] = await artworkService.findByFlagAndSourceTypeIdOnly(ArtworkFlag.AWAITING, ArtworkSourceType.SONG).then((artworks) => {
            return artworks.map((artwork) => artwork.id);
        });

        if(songArtworkIds.length > 0) {
            const result = await createFromSong(songArtworkIds).catch((error) => {
                console.error(error);
                return null;
            });
            processResult.artworks.push(...(result?.artworks ?? []));
        }

        /**
         * Do for artworks that are source from an url
         */
        const urlArtworkIds: string[] = await artworkService.findByFlagAndSourceTypeIdOnly(ArtworkFlag.AWAITING, ArtworkSourceType.URL).then((artworks) => {
            return artworks.map((artwork) => artwork.id);
        });

        if(urlArtworkIds.length > 0) {
            const result = await createFromUrl(urlArtworkIds).catch((error) => {
                console.error(error);
                return null;
            });
            processResult.artworks.push(...(result?.artworks ?? []));
        }

        // Update time took
        processResult.timeTookMs = Date.now() - startedAtMs;
        return processResult;
    });
}

