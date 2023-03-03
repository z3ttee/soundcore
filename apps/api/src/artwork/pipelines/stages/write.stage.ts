import { getSharedOrDefault, StepParams } from "@soundcore/pipelines";
import { DataSource } from "typeorm";
import { Artwork } from "../../entities/artwork.entity";

export async function step_write_artworks(params: StepParams) {
    const datasource: DataSource = params.resources.datasource;
    const artworkRepo = datasource.getRepository(Artwork);

    const artworkIds: Pick<Artwork, "id">[] = getSharedOrDefault(`artworks`, []);

    console.log(artworkIds.length);
}