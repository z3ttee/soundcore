import { setShared, StepParams } from "@soundcore/pipelines";
import { DataSource } from "typeorm";
import { Artwork, ArtworkFlag } from "../../entities/artwork.entity";
import { ArtworkPipelineEnv } from "../artwork.pipeline";

export async function step_checkout_artworks(params: StepParams) {
    const datasource: DataSource = params.resources.datasource;
    const artworkRepo = datasource.getRepository(Artwork);

    return artworkRepo.createQueryBuilder("artwork")
        .select(["artwork.id"])
        .where("artwork.flag = :flag", { flag: ArtworkFlag.AWAITING })
        .getMany().then((artworks) => {
            setShared("artworks", artworks);
        });
}

export async function step_checkout_flags_only_artworks(params: StepParams) {
    const datasource: DataSource = params.resources.datasource;
    const flags: ArtworkFlag[] = (params.environment as ArtworkPipelineEnv).withFlagsOnly ?? [];
    const artworkRepo = datasource.getRepository(Artwork);

    if(flags.length <= 0) {
        params.step.skip("No flags specified");
    }

    return artworkRepo.createQueryBuilder("artwork")
        .select(["artwork.id"])
        .where("artwork.flag IN(:flags)", { flags: flags.join(",") })
        .getMany().then((artworks) => {
            setShared("artworks", artworks);
        });
}

export async function step_checkout_selected_artworks(params: StepParams) {
    const datasource: DataSource = params.resources.datasource;
    const selectedIds = (params.environment as ArtworkPipelineEnv).selectedIds ?? [];
    const artworkRepo = datasource.getRepository(Artwork);

    if(selectedIds.length <= 0) {
        params.step.skip("No artworks selected");
    }

    return artworkRepo.createQueryBuilder("artwork")
        .select(["artwork.id"])
        .where("artwork.id IN(:ids)", { ids: selectedIds.join(",") })
        .getMany().then((artworks) => {
            setShared("artworks", artworks);
        });
}