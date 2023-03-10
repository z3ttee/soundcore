import { Batch } from "@soundcore/common";
import { MeiliClient, MeiliIndex } from "@soundcore/meilisearch";
import { progress, StepParams } from "@soundcore/pipelines";
import { Page, Pageable } from "nestjs-pager";
import { DataSource } from "typeorm";
import { Album } from "../../../album/entities/album.entity";
import { AlbumMeiliService } from "../../../album/services/album-meili.service";
import { Artist } from "../../../artist/entities/artist.entity";
import { ArtistMeiliService } from "../../../artist/services/artist-meili.service";
import { Song } from "../../../song/entities/song.entity";
import { SongMeiliService } from "../../../song/services/song-meili.service";

export async function stage_checkout_resources(params: StepParams) {    
    
}

export async function step_sync_artists(params: StepParams) {
    const { resources, logger } = params;
    const datasource: DataSource = resources.datasource;
    const meilisearch: MeiliClient = resources.meilisearch;

    const artistRepo = datasource.getRepository(Artist);
    const index: MeiliIndex<Artist> = meilisearch.getIndexFromSchema(Artist);
    const service = new ArtistMeiliService(index, artistRepo);

    const entities: Artist[] = [];
    let pageIndex = 0;
    let limit = 100;

    do {
        const page = await service.fetchEntities(new Pageable(pageIndex, limit)).catch((error: Error) => {
            logger.error(`Failed fetching due entities: ${error.message}`);
            return Page.of([], 0);
        });

        if(page.size <= 0) break;

        entities.push(...page.elements);
        pageIndex++;
    } while (true);

    return Batch.useDataset(entities).onError((err, _, batchNr) => {
        logger.error(`Failed processing for batch #${batchNr}: ${err.message}`);
    }).forEach((batch, current, total) => {
        return service.syncAndUpdateEntities(batch).then((updateResult) => {
            return batch;
        }).finally(() => {
            progress(current/total);
        })
    }).then((artists) => {
        logger.info(`Successfully synced ${artists.length} artists with meilisearch`);
    }).catch((error: Error) => {
        logger.error(`Error occured whilst syncing artists with meilisearch: ${error.message}`, error.stack);
        throw error;
    });
}

export async function step_sync_albums(params: StepParams) {
    const { resources, logger } = params;
    const datasource: DataSource = resources.datasource;
    const meilisearch: MeiliClient = resources.meilisearch;

    const repository = datasource.getRepository(Album);
    const index: MeiliIndex<Album> = meilisearch.getIndexFromSchema(Album);
    const service = new AlbumMeiliService(index, repository);

    const entities: Album[] = [];
    let pageIndex = 0;
    let limit = 100;

    do {
        const page = await service.fetchEntities(new Pageable(pageIndex, limit)).catch((error: Error) => {
            logger.error(`Failed fetching due entities: ${error.message}`);
            return Page.of([], 0);
        });

        if(page.size <= 0) break;

        entities.push(...page.elements);
        pageIndex++;
    } while (true);

    return Batch.useDataset(entities).onError((err, _, batchNr) => {
        logger.error(`Failed processing for batch #${batchNr}: ${err.message}`);
    }).forEach((batch, current, total) => {
        return service.syncAndUpdateEntities(batch).then((updateResult) => {
            return batch;
        }).finally(() => {
            progress(current/total);
        })
    }).then((albums) => {
        logger.info(`Successfully synced ${albums.length} albums with meilisearch`);
    }).catch((error: Error) => {
        logger.error(`Error occured whilst syncing albums with meilisearch: ${error.message}`, error.stack);
        throw error;
    });
}

export async function step_sync_songs(params: StepParams) {
    const { resources, logger } = params;
    const datasource: DataSource = resources.datasource;
    const meilisearch: MeiliClient = resources.meilisearch;

    const repository = datasource.getRepository(Song);
    const index: MeiliIndex<Song> = meilisearch.getIndexFromSchema(Song);
    const service = new SongMeiliService(index, repository);

    const entities: Song[] = [];
    let pageIndex = 0;
    let limit = 100;

    do {
        const page = await service.fetchEntities(new Pageable(pageIndex, limit)).catch((error: Error) => {
            logger.error(`Failed fetching due entities: ${error.message}`);
            return Page.of([], 0);
        });

        if(page.size <= 0) break;

        entities.push(...page.elements);
        pageIndex++;
    } while (true);

    return Batch.useDataset(entities).onError((err, _, batchNr) => {
        logger.error(`Failed processing for batch #${batchNr}: ${err.message}`);
    }).forEach((batch, current, total) => {
        return service.syncAndUpdateEntities(batch).then((updateResult) => {
            return batch;
        }).finally(() => {
            progress(current/total);
        })
    }).then((songs) => {
        logger.info(`Successfully synced ${songs.length} songs with meilisearch`);
    }).catch((error: Error) => {
        logger.error(`Error occured whilst syncing songs with meilisearch: ${error.message}`, error.stack);
        throw error;
    });
}