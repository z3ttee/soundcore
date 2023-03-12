import { setShared, StepParams } from "@soundcore/pipelines";
import { DataSource } from "typeorm";
import { Artwork, ArtworkFlag, ArtworkType } from "../../entities/artwork.entity";
import { ArtworkPipelineEnv } from "../artwork.pipeline";

export async function step_checkout_artworks(params: StepParams) {
    return createQueryBuilder(params, "artwork.flag = :flag", { flag: ArtworkFlag.AWAITING }).then((artworks) => {
        setShared("artworks", artworks);
    });
}

export async function step_checkout_flags_only_artworks(params: StepParams) {
    const flags: ArtworkFlag[] = (params.environment as ArtworkPipelineEnv).withFlagsOnly ?? [];

    if(flags.length <= 0) {
        params.step.skip("No flags specified");
    }

    return createQueryBuilder(params, "artwork.flag IN(:flags)", { flags: flags.join(",") }).then((artworks) => {
        setShared("artworks", artworks);
    });
}

export async function step_checkout_selected_artworks(params: StepParams) {
    const selectedIds = (params.environment as ArtworkPipelineEnv).selectedIds ?? [];

    if(selectedIds.length <= 0) {
        params.step.skip("No artworks selected");
    }

    return createQueryBuilder(params, "artwork.id IN(:ids)", { ids: selectedIds.join(",") }).then((artworks) => {
        setShared("artworks", artworks);
    });
}

export async function step_checkout_types_only_artworks(params: StepParams) {
    const types: ArtworkType[] = (params.environment as ArtworkPipelineEnv).withTypesOnly ?? [];

    if(types.length <= 0) {
        params.step.skip("No types specified");
    }

    return createQueryBuilder(params, "artwork.type IN(:types) AND artwork.flag = :flag", { types: types.join(","), flag: ArtworkFlag.AWAITING }).then((artworks) => {
        setShared("artworks", artworks);
    });
}

/**
 * Create general query builder.
 * @param params Step params
 * @param where Where clause for query
 * @param parameters Parameters to insert into where clause
 */
async function createQueryBuilder(params: StepParams, where: string, parameters: any) {
    const datasource: DataSource = params.resources.datasource;
    const artworkRepo = datasource.getRepository(Artwork);

    const query = artworkRepo.createQueryBuilder("artwork")
        .select(["artwork.id", "artwork.type", "artwork.dstType", "artwork.srcUrl"])
        .leftJoin("artwork.songs", "songs").addSelect(["songs.id"])
        .leftJoin("artwork.albums", "albums").addSelect(["albums.id"])
        .leftJoin("artwork.artists", "artists").addSelect(["artists.id"])
        .where(where, parameters);

    return query.getMany();
}