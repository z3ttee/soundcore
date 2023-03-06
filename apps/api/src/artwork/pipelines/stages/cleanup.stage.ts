import { Batch } from "@soundcore/common";
import { getOrDefault, progress, StepParams } from "@soundcore/pipelines";
import { DataSource } from "typeorm";
import { Artwork, ArtworkFlag, ArtworkWriteResult } from "../../entities/artwork.entity";
import { ARTWORK_STAGE_PROCESS_ARTWORKS_ID, ARTWORK_STEP_WRITE_ARTWORKS_ID } from "../constants";

export async function step_update_succeeded_artworks(params: StepParams) {
    const { resources, logger } = params;
    const artworks: ArtworkWriteResult = getOrDefault(`${ARTWORK_STAGE_PROCESS_ARTWORKS_ID}.${ARTWORK_STEP_WRITE_ARTWORKS_ID}.artworks`, { errored: [], succeeded: [] });

    const datasource: DataSource = resources.datasource;
    const artworkRepo = datasource.getRepository(Artwork);

    return Batch.useDataset(artworks.succeeded).onError((err, _, batchNr) => {
        logger.error(`Failed processing batch #${batchNr}: ${err.message}`);
    }).forEach((batch, current, total) => {
        return artworkRepo.save(batch).then((results) => {
            return batch;
        }).finally(() => {
            progress(current/total);
        })
    }).then((result) => {
        logger.info(`Successfully updated ${result.length} succeeded artworks`);
    }).catch((error: Error) => {
        logger.error(`Failed updating status for succeeded artworks: ${error.message}`);
        throw error;
    })
}

export async function step_update_errored_artworks(params: StepParams) {
    const { resources, logger } = params;
    const artworks: ArtworkWriteResult = getOrDefault(`${ARTWORK_STAGE_PROCESS_ARTWORKS_ID}.${ARTWORK_STEP_WRITE_ARTWORKS_ID}.artworks`, { errored: [], succeeded: [] });

    const datasource: DataSource = resources.datasource;
    const artworkRepo = datasource.getRepository(Artwork);

    return Batch.useDataset(artworks.errored).onError((err, _, batchNr) => {
        logger.error(`Failed processing batch #${batchNr}: ${err.message}`, err.stack);
    }).forEach((batch, current, total) => {
        return artworkRepo.createQueryBuilder()
            .update()
            .set({ flag: ArtworkFlag.ERROR })
            .whereInIds(artworks)
            .execute().then((updateResult) => {
                logger.info(`Marked ${updateResult.affected} artworks as ERRORED`);
                return batch;
            }).finally(() => {
                progress(current/total);
            })
    }).then((result) => {
        logger.info(`Successfully updated ${result.length} errored artworks`);
    }).catch((error: Error) => {
        logger.error(`Failed updating status for errored artworks: ${error.message}`);
        throw error;
    });
}