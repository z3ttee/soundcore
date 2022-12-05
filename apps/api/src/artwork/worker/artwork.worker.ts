import { InternalServerErrorException } from "@nestjs/common";
import { Batch } from "@soundcore/common";
import { WorkerJobRef } from "@soundcore/nest-queue";
import { FileSystemService } from "../../filesystem/services/filesystem.service";
import { Song } from "../../song/entities/song.entity";
import { SongService } from "../../song/services/song.service";
import Database from "../../utils/database/database-worker-client";
import { ArtworkProcessResultDTO } from "../dtos/artwork-process-result.dto";
import { ArtworkProcessDTO, ArtworkSourceType } from "../dtos/artwork-process.dto";
import { Artwork, ArtworkFlag, ArtworkID } from "../entities/artwork.entity";
import { ArtworkService } from "../services/artwork.service";

export default async function (job: WorkerJobRef<ArtworkProcessDTO>): Promise<ArtworkProcessResultDTO> {
    const { sourceType } = job.payload;

    if(sourceType == ArtworkSourceType.SONG) {
        return createFromSong(job);
    } else if(sourceType == ArtworkSourceType.URL) {
        return createFromUrl(job);
    } else {
        throw new Error(`Received artwork process task with invalid source type. Received ${sourceType}, expected one of [${Object.values(ArtworkSourceType).join(", ")}]`);
    }
}

async function createFromSong(job: WorkerJobRef<ArtworkProcessDTO<string>>): Promise<ArtworkProcessResultDTO> {
    return Database.connect().then(async (datasource) => {
        const startedAtMs = Date.now();
        const fsService = new FileSystemService();

        const artworkRepo = datasource.getRepository(Artwork);
        const songRepo = datasource.getRepository(Song);

        const artworkService = new ArtworkService(artworkRepo, fsService);
        const songService = new SongService(songRepo, null, null);

        const artworkIds = job.payload.entities;

        return Batch.of(artworkIds, 10).do(async (batch) => {
            const songs = await songService.findByArtworkIds(batch).catch((err) => {
                console.error(err)
                return [];
            });

            const succeededArtworks: string[] = [];
            const erroredArtworks: string[] = [];

            for(const song of songs) {
                const file = song.file;
                const filepath = fsService.resolveFilepath(file);

                if(typeof file === "undefined" || file == null) {
                    throw new InternalServerErrorException(`Could not find file entity on song object.`);
                }

                const tags = await songService.readID3TagsFromFile(filepath);
                const buffer = tags.cover;

                await artworkService.writeFromBufferOrFile(buffer, song.artwork).then((artwork) => {
                    succeededArtworks.push(artwork.id);
                }).catch((error: Error) => {
                    erroredArtworks.push(song.artwork.id);
                    console.error(error);
                    throw new InternalServerErrorException(`Failed writing artwork to file ${filepath}: ${error.message}`, error.stack);
                });
            }
                    
            return artworkService.removeSourceInfos(batch).then(() => {
                return artworkService.setFlags([...erroredArtworks], ArtworkFlag.ERROR).then(() => {
                    return artworkService.setFlags(succeededArtworks, ArtworkFlag.OK).then((updated) => {
                        return batch;
                    });
                });
            });
        }).catch(async (_, error: Error) => {
            await artworkService.setFlags(artworkIds, ArtworkFlag.ERROR);
            throw error;
        }).start().then((value): ArtworkProcessResultDTO => {
            return {
                artworks: value,
                timeTookMs: Date.now() - startedAtMs
            }
        });
    });
}

async function createFromUrl(job: WorkerJobRef<ArtworkProcessDTO<string>>): Promise<ArtworkProcessResultDTO> {
    //const url = job.payload.source.data;
    return null;
}

