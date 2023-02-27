import { DataSource } from "typeorm";
import { FileSystemService } from "../../../filesystem/services/filesystem.service";
import { Batch } from "@soundcore/common";
import { STAGE_METADATA_ID, STEP_CREATE_SONGS_ID } from "../../pipelines";
import { getOrDefault, progress, StepParams } from "@soundcore/pipelines";
import { Artwork } from "../../../artwork/entities/artwork.entity";
import { ArtworkService } from "../../../artwork/services/artwork.service";
import { Song, SONG_ARTWORK_RELATION_FK } from "../../../song/entities/song.entity";
import { CreateArtworkDTO } from "../../../artwork/dtos/create-artwork.dto";
import { ResultSetHeader } from "mysql2";

/**
 * Create artwork entities for given songs
 * @param step Current step to write result
 * @param env Environment containing the mountId
 * @param datasource Datasource used for database connection
 * @param logger Logger instance
 */
export async function step_create_artwork_entities(params: StepParams) {
    const { logger, resources } = params;
    const datasource: DataSource = resources.datasource;

    // Step preparation
    const songs: Map<string, Song> = getOrDefault(`${STAGE_METADATA_ID}.${STEP_CREATE_SONGS_ID}.songs`, new Map());
    const fsService = new FileSystemService();
    
    // Create query runner to control transaction
    const queryRunner = datasource.createQueryRunner();

    // Split songs dataset into batches to not spam the database
    return Batch.useDataset<Song, Song>(Array.from(songs.values())).onError((error, _, batchNr) => {
        // Log errors
        logger.error(`Failed processing batch #${batchNr}: ${error.message}`, error.stack);
    }).map(async (batch, currentBatch, totalBatches) => {

        // Open new transaction for batch
        await queryRunner.startTransaction();

        // Get connection manager
        const manager = queryRunner.manager;

        // Get repositories
        const artworkRepo = manager.getRepository(Artwork);
        const songRepo = manager.getRepository(Song);

        // Create service instances
        const artworkService = new ArtworkService(artworkRepo, fsService);

        const artwork2song: Map<string, string[]> = new Map();
        const result: Map<string, Song> = new Map();
        const dtos: CreateArtworkDTO[] = [];    
        
        // Loop through songs in batch to create artwork dtos
        // that are then saved in the database.
        for(const song of batch) {
            // Create DTO using artwork service
            const dto = artworkService.createDTOForSong(song);

            // Map the artwork (key) to songs (value)
            if(artwork2song.has(dto.id)) {
                const ids = artwork2song.get(dto.id);
                ids.push(song.id);
                artwork2song.set(dto.id, ids);
            } else {
                artwork2song.set(dto.id, [song.id]);
            }
            
            // Push to dtos for database insertion
            dtos.push(dto);
        }

        try {
            // Insert dtos into database if they do not exist 
            // and return artworks only with their id
            await artworkService.createIfNotExists(dtos, (query, alias) => query.select([`${alias}.id`])).then((artworks) => {
                // Loop through created artworks and map
                // artwork ids to song
                for(const artwork of artworks) {
                    const songIds = artwork2song.get(artwork.id);
    
                    for(const songId of songIds) {
                        // Map artwork to songs
                        result.set(songId, {
                            id: songId,
                            artwork: { id: artwork.id } as Artwork
                        } as Song);
                    }
                }

                logger.info(`Created and fetched ${artworks.length} artworks`);
            }).catch((error: Error) => {
                // Handle insertion errors
                logger.error(`Failed creating artwork entities in database: ${error.message}`, error.stack);
                // Throw error to rollback changes
                throw error;
            });

            // Throw error if data is not valid for following steps
            if(Array.from(result.keys()).length <= 0) throw new Error("Received invalid song and artwork mapping.");

            // Save artwork<->song relation
            // This builds a raw query to update multiple entries at once.
            // A CASE-Statement is used to change columns based on the id of the row
            let sql = `UPDATE ${songRepo.metadata.tableName} SET ${SONG_ARTWORK_RELATION_FK} = CASE id `;
            for(const data of Array.from(result.values())) {
                const artworkId = data.artwork?.id;
                if(typeof artworkId === "undefined" || artworkId == null) continue;
                // Add a new condition inside CASE
                sql += `WHEN '${data.id}' THEN '${data.artwork.id}'`;
            }
            // Dont forget to END case statement and add WHERE clause
            sql += ` END WHERE id IN('${Array.from(result.keys()).join("','")}');`;

            // Execute raw sql query
            await manager.query(sql).then((values: ResultSetHeader) => {
                // Handle success
                logger.info(`Updated artworks for ${values.affectedRows} songs`);
            }).catch((error: Error) => {
                // Handle insertion errors
                logger.error(`Failed saving artwork relations for songs in database: ${error.message}`, error.stack);
                // Throw error to rollback changes
                throw error;
            });

            // Commit the transaction
            await queryRunner.commitTransaction().then(() => {
                // Handle success
                logger.info(`Successfully created artworks and relations with songs`);
            }).catch((error: Error) => {
                // Handle transaction error
                logger.warn(`Could not commit changes to the database: ${error.message}`);
                // Throw error so we can rollback the transaction in catch-phrase
                throw error;
            });
        } catch (err) {
            // If an error occured, rollback the changes
            // made by the transaction
            await queryRunner.rollbackTransaction().then(() => {
                // Log rollback success
                logger.warn(`Rolled back changes made to the database`);
            }).catch((error: Error) => {
                // Log error whilst rolling back
                logger.error(`Could not roll back changes in database: ${error.message}`, error.stack);
            });

            // Throw error to handle error via batch onError()
            throw err;
        }

        // Post progress
        progress(currentBatch/totalBatches);

        // Return result
        return result;
    }).then((createdArtworks) => {
        logger.info(`Created ${createdArtworks.size} artworks in database.`);
    }).catch((error: Error) => {
        logger.error(`Failed creating artworks: ${error.message}`, error.stack);
    }).finally(async () => {
        // Release resources of the query runner
        await queryRunner.release();
    });
}