import { Batch } from "@soundcore/common";
import { getOrDefault, StepParams } from "@soundcore/pipelines";
import { DataSource } from "typeorm";
import { Artwork } from "../../entities/artwork.entity";
import { ARTWORK_STAGE_PROCESS_ARTWORKS_ID, ARTWORK_STEP_WRITE_ARTWORKS_ID } from "../constants";
import { ArtworkWriteResult } from "./write.stage";

export async function step_update_succeeded_artworks(params: StepParams) {
    const resources = params.resources;
    const artworks: ArtworkWriteResult = getOrDefault(`${ARTWORK_STAGE_PROCESS_ARTWORKS_ID}.${ARTWORK_STEP_WRITE_ARTWORKS_ID}.artworks`, { errored: [], succeeded: [] });

    const datasource: DataSource = resources.datasource;
    const artworkRepo = datasource.getRepository(Artwork);

    console.log(artworks);


}

export async function step_update_errored_artworks(params: StepParams) {
    const { resources, logger } = params;
    const artworks: ArtworkWriteResult = getOrDefault(`${ARTWORK_STAGE_PROCESS_ARTWORKS_ID}.${ARTWORK_STEP_WRITE_ARTWORKS_ID}.artworks`, { errored: [], succeeded: [] });

    const datasource: DataSource = resources.datasource;
    const artworkRepo = datasource.getRepository(Artwork);

    console.log(artworks);

    return Batch.useDataset(artworks.errored).onError((err, _, batchNr) => {
        logger.error(`Failed processing batch #${batchNr}: ${err.message}`, err.stack);
    }).forEach((batch, current, total) => {
        return artworkRepo.createQueryBuilder()
            .update()
            .set({ flag: Artw })
    }).then((result) => {
        logger.info(`Successfully updated ${result.length} succeeded artworks`);
    }).catch((error: Error) => {
        logger.error(`Failed updating status for succeeded artworks: ${error.message}`);
        throw error;
    });
}