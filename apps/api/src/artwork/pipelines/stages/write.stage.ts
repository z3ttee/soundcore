import { Batch } from "@soundcore/common";
import { getSharedOrDefault, progress, set, StepParams } from "@soundcore/pipelines";
import { DataSource } from "typeorm";
import { File } from "../../../file/entities/file.entity";
import { FileService } from "../../../file/services/file.service";
import { FileSystemService } from "../../../filesystem/services/filesystem.service";
import { SongService } from "../../../song/services/song.service";
import { ArtworkDTO, ArtworkFlag, ArtworkType, ArtworkWithColorDTO, ArtworkWriteResult } from "../../entities/artwork.entity";
import { ArtworkService } from "../../services/artwork.service";

/**
 * Writing artworks step. This will download or extract the artwork
 * from an mp3 file based on its type
 * @param params Parameters of the current step
 */
export async function step_write_artworks(params: StepParams) {
    const logger = params.logger;

    const artworkDtos: ArtworkDTO[] = getSharedOrDefault(`artworks`, []);
    const groupedByTypes: Map<ArtworkType, ArtworkDTO[]> = new Map();

    // Group checked out artworks by their types
    for(const artwork of artworkDtos) {
        const type = artwork.type;

        const list = groupedByTypes.get(type) ?? [];
        list.push(artwork);

        groupedByTypes.set(type, list);
    }

    const succeededArtworks: ArtworkWithColorDTO[] = [];
    const erroredArtworks: ArtworkDTO[] = [];

    if(groupedByTypes.has(ArtworkType.SONG)) {
        // Process artworks with type song
        await extract_from_mp3_file(groupedByTypes.get(ArtworkType.SONG), params).then((artworks) => {
            succeededArtworks.push(...artworks.succeeded);
            erroredArtworks.push(...artworks.errored);
        }).catch((error: Error) => {
            logger.error(`Failed processing artworks of type '${ArtworkType.SONG}': ${error.message}`, error.stack);
            erroredArtworks.push(...groupedByTypes.get(ArtworkType.SONG));
        });
    }

    set("artworks", {
        errored: erroredArtworks,
        succeeded: succeededArtworks
    } as ArtworkWriteResult);
}

/**
 * Extract artwork file embedded into a mp3 file
 * @param dtos List of artworks to extract artwork for
 * @param params Params of the current step
 */
async function extract_from_mp3_file(dtos: ArtworkDTO[], params: StepParams): Promise<ArtworkWriteResult> {
    const { logger, resources } = params;

    const datasource: DataSource = resources.datasource;
    const fsService = new FileSystemService();

    const fileRepo = datasource.getRepository(File);
    const fileService = new FileService(fileRepo);
    const songService = new SongService(null);
    const artworkService = new ArtworkService(null, null, fsService, null);

    const song2artwork: Map<string, ArtworkDTO> = new Map();

    logger.info(`Collecting song infos and fetching file details...`);

    // Get songs from dtos to fetch file info
    for(const dto of dtos) {
        if(dto.songs?.length <= 0) continue;
        // Add only first song, as they obviously have the same artwork, so only
        // one needs to be used for extraction
        const song = dto.songs?.[0];
        song2artwork.set(song.id, dto);
    }

    const succeededArtworks: ArtworkWithColorDTO[] = [];
    const erroredArtworks: ArtworkDTO[] = [];

    // Fetch files
    return Batch.useDataset<string, ArtworkDTO>(Array.from(song2artwork.keys())).onError((err, _, batchNr) => {
        logger.error(`Failed processing batch #${batchNr}: ${err.message}`, err.stack);
    }).forEach((batch, current, total) => {
        return fileService.findBySongIdsForArtworkProcessing(batch).then(async (files) => {
            for(const file of files) {
                const artwork = song2artwork.get(file.song.id) as ArtworkWithColorDTO;
                const filepath = fsService.resolveFilepath(file);

                const tags = await songService.readID3TagsFromFile(filepath);
                const buffer = tags.cover;

                await artworkService.writeFromBufferOrFile(buffer, artwork).then(async () => {
                    const color = await artworkService.extractAccentColor(artwork).catch((error: Error) => {
                        logger.error(`Failed extracting accent color from artwork '${filepath}': ${error.message}`);
                        return null;
                    });

                    artwork.accentColor = color ?? artwork.accentColor;
                    artwork.flag = ArtworkFlag.OK;
                    succeededArtworks.push(artwork);
                }).catch((error: Error) => {
                    erroredArtworks.push(artwork);
                    logger.error(`Failed writing artwork to file: ${error.message}`, error.stack);
                });
            }

        }).then(() => {
            return [];
        }).finally(() => {
            progress(current/total);
        })
    }).then((_): ArtworkWriteResult => {
        return {
            succeeded: succeededArtworks,
            errored: erroredArtworks
        };
    }).catch((error: Error) => {
        console.error(error);
        throw error;
    })
}