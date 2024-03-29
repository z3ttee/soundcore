import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { AlbumService } from "../../album/services/album.service";
import { Album } from "../../album/entities/album.entity";
import { ArtistService } from "../../artist/services/artist.service";
import { Artist } from "../../artist/entities/artist.entity";
import { Distributor } from "../../distributor/entities/distributor.entity";
import { DistributorService } from "../../distributor/services/distributor.service";
import { Label } from "../../label/entities/label.entity";
import { LabelService } from "../../label/services/label.service";
import { Publisher } from "../../publisher/entities/publisher.entity";
import { PublisherService } from "../../publisher/services/publisher.service";
import { Song } from "../../song/entities/song.entity";
import { SongService } from "../../song/services/song.service";
import { MeilisearchFlag } from "../../utils/entities/meilisearch.entity";
import { Page, Pageable } from "@soundcore/common";

const SYNC_ITEMS_LIMIT = 100;

@Injectable()
export class MeiliSyncer {
    private readonly logger = new Logger(MeiliSyncer.name);

    private _isResolvingSyncErrors = false;

    constructor(
        private readonly artistService: ArtistService,
        private readonly albumService: AlbumService,
        private readonly songService: SongService,
        private readonly publisherService: PublisherService,
        private readonly labelService: LabelService,
        private readonly distributorService: DistributorService
    ) { }

    /**
     * Check if syncs have been marked as failed
     * in the database every 30 seconds.
     */
    @Cron('30 * * * * *')
    public async checkMeilisearchSyncFlags() {
        // Skip this iteration, if the application is still busy
        // with resolve the errors.
        if(this._isResolvingSyncErrors) return;

        // Get start time
        const startedAt: number = Date.now();

        // Otherwise mark as busy
        this._isResolvingSyncErrors = true;

        // Only check 50 entities at once. Because this has to be done for
        // more than one table, this could cause some performance issues when
        // doing larger requests. This is compensated of the frequency of the cron job.

        const affectedEntities = await Promise.all([
            this.artistService.findBySyncFlag(MeilisearchFlag.FAILED, new Pageable(0, SYNC_ITEMS_LIMIT)).catch(() => Page.empty<Artist>()),
            this.albumService.findBySyncFlag(MeilisearchFlag.FAILED, new Pageable(0, SYNC_ITEMS_LIMIT)).catch(() => Page.empty<Album>()),
            Page.empty(),// this.songService.findBySyncFlag(MeilisearchFlag.FAILED, new Pageable(0, SYNC_ITEMS_LIMIT)).catch(() => Page.empty<Song>()),
            this.labelService.findBySyncFlag(MeilisearchFlag.FAILED, new Pageable(0, SYNC_ITEMS_LIMIT)).catch(() => Page.empty<Label>()),
            this.publisherService.findBySyncFlag(MeilisearchFlag.FAILED, new Pageable(0, SYNC_ITEMS_LIMIT)).catch(() => Page.empty<Publisher>()),
            this.distributorService.findBySyncFlag(MeilisearchFlag.FAILED, new Pageable(0, SYNC_ITEMS_LIMIT)).catch(() => Page.empty<Distributor>())
        ]).catch(() => [])

        const affectedArtists = affectedEntities[0];
        const affectedAlbums = affectedEntities[1];
        const affectedSongs = affectedEntities[2];
        const affectedLabels = affectedEntities[3];
        const affectedPublishers = affectedEntities[4];
        const affectedDistributors = affectedEntities[5];
    
        // Resolve errors
        await Promise.all([
            this.resolveSyncErrorsForArtists(affectedArtists.elements).catch(() => null),
            this.resolveSyncErrorsForAlbums(affectedAlbums.elements).catch(() => null),
            this.resolveSyncErrorsForSongs(affectedSongs.elements).catch(() => null),
            this.resolveSyncErrorsForPublishers(affectedPublishers.elements).catch(() => null),
            this.resolveSyncErrorsForPublishers(affectedPublishers.elements).catch(() => null),
            this.resolveSyncErrorsForLabels(affectedLabels.elements).catch(() => null),
            this.resolveSyncErrorsForDistributors(affectedDistributors.elements).catch(() => null)
        ]).catch(() => null);

        // Build time stats
        const resolvedIssues: number = affectedArtists.size + affectedAlbums.size + affectedSongs.size + affectedPublishers.size + affectedLabels.size + affectedDistributors.size;
        if(resolvedIssues > 0) {
            const endedAt: number = Date.now();
            const timeTook: number = endedAt - startedAt;

            this.logger.debug(`Resolved ${resolvedIssues} sync issues in ${timeTook}ms.`);
        }

        // Mark as not busy
        this._isResolvingSyncErrors = false;
    }

    private async resolveSyncErrorsForArtists(resources: Artist[]) {
        // if(resources?.length <= 0) return;
        // return this.artistService.sync(resources).catch((error) => {
        //     this.logger.error(`Failed resolving sync issues for ${resources.length} artists`, error.stack);
        // });
    }

    private async resolveSyncErrorsForAlbums(resources: Album[]) {
        if(resources?.length <= 0) return;
        return this.albumService.syncWithMeilisearch(resources).catch((error) => {
            this.logger.error(`Failed resolving sync issues for ${resources.length} albums`, error.stack);
        });
    }

    private async resolveSyncErrorsForSongs(resources: Song[]) {
        if(resources?.length <= 0) return;
        return this.songService.syncWithMeilisearch(resources).catch((error) => {
            this.logger.error(`Failed resolving sync issues for ${resources.length} songs`, error.stack);
        });
    }

    private async resolveSyncErrorsForPublishers(resources: Publisher[]) {
        if(resources?.length <= 0) return;
        return this.publisherService.sync(resources).catch((error) => {
            this.logger.error(`Failed resolving sync issues for ${resources.length} publishers`, error.stack);
        });
    }

    private async resolveSyncErrorsForLabels(resources: Label[]) {
        if(resources?.length <= 0) return;
        return this.labelService.sync(resources).catch((error) => {
            this.logger.error(`Failed resolving sync issues for ${resources.length} labels`, error.stack);
        });
    }

    private async resolveSyncErrorsForDistributors(resources: Distributor[]) {
        if(resources?.length <= 0) return;
        return this.distributorService.sync(resources).catch((error) => {
            this.logger.error(`Failed resolving sync issues for ${resources.length} distributors`, error.stack);
        });
    }
}