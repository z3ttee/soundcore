import { MeiliClient } from "@soundcore/meilisearch";
import { StepParams } from "@soundcore/pipelines";
import { DataSource } from "typeorm";
import { Artist, ArtistIndex } from "../../../artist/entities/artist.entity";
import { MeilisearchPipelineEnv } from "../meilisearch.pipeline";

export function stage_checkout_resources(params: StepParams) {
    const environment = params.environment as MeilisearchPipelineEnv;
    
    const { resources, logger } = params;
    const datasource: DataSource = resources.datasource;
    const meilisearch: MeiliClient = resources.meilisearch;

    const artistRepo = datasource.getRepository(Artist);
    const index = meilisearch.getIndexFromSchema(ArtistIndex);

    console.log(index.uid);
}