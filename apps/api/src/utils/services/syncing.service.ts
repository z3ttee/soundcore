import { EventEmitter2 } from "@nestjs/event-emitter";
import { EVENT_ALBUMS_CHANGED, EVENT_ARTISTS_CHANGED, EVENT_PLAYLISTS_CHANGED, EVENT_SONGS_CHANGED } from "../../constants";
import { MeiliJobType } from "../../meilisearch/entities/meili-job.entity";

export abstract class SyncingService<T = any> {

    constructor(
        protected readonly eventEmitter: EventEmitter2
    ) {}

    /**
     * This will emit an event that the meilisearch module
     * can catch to enqueue a job for the requested synchronisation.
     * @param resource List of resources to sync
     * @returns Song
     */
    public async prepareForMeiliSync(resources: T[], type: MeiliJobType) {
        let eventName;

        switch (type) {
            case MeiliJobType.SYNC_ALBUMS:
                eventName = EVENT_ALBUMS_CHANGED;
                break;
            case MeiliJobType.SYNC_ARTISTS:
                eventName = EVENT_ARTISTS_CHANGED;
                break;
            case MeiliJobType.SYNC_PLAYLISTS:
                eventName = EVENT_PLAYLISTS_CHANGED;
                break;
            case MeiliJobType.SYNC_SONGS:
                eventName = EVENT_SONGS_CHANGED;
                break;

            default:
                break;
        }

        if(!eventName) return;
        this.eventEmitter.emitAsync(eventName, resources);
    }

}