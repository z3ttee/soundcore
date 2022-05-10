import { HttpClient } from "@angular/common/http";
import { Subscription } from "rxjs";
import { SCNGXPlayableList } from "../../entities/playable-list.entity";
import { SCNGXLogger } from "../logger/logger";

export class PlayableListBuilder {
    private readonly logger: SCNGXLogger = new SCNGXLogger(PlayableListBuilder.name);

    /** @internal */
    public static activeListsByMetaUrl = new Map<String, SCNGXPlayableList>();
    /** @internal */
    public static activeSubs = new Map<String, Subscription>();

    constructor(
        private readonly httpClient: HttpClient
    ) {}

    private _listUrl: string;
    private _metaUrl: string;

    public static withClient(httpClient: HttpClient) {
        return new PlayableListBuilder(httpClient);
    }

    /**
     * Define endpoint to use to fetch metadata from.
     * @param url URL to metadata
     * @returns PlayableListBuilder
     */
    public metaUrl(url: string): PlayableListBuilder {
        this._metaUrl = url;
        return this;
    }

    /**
     * Define endpoint to use to fetch track list.
     * If not defined, the metaUrl is used and /ids is appended.
     * @param url URL to metadata
     * @returns PlayableListBuilder
     */
    public listUrl(url: string): PlayableListBuilder {
        this._listUrl = url;
        return this;
    }

    public build(): SCNGXPlayableList {
        if(!this._metaUrl) throw new Error("Building a playable list requires you to define the metaUrl.");
        if(!this._listUrl) this._listUrl = this._metaUrl + "/ids";

        /**
         * Check if the registry contains a list with the same metaUrl.
         * Return if found, so it can be recycled.
         */
        if(PlayableListBuilder.activeListsByMetaUrl.has(this._metaUrl)) {
            const list = PlayableListBuilder.activeListsByMetaUrl.get(this._metaUrl);
            this.logger.debug("Found list with same metaUrl in registry. Using this one.", list)
            return PlayableListBuilder.activeListsByMetaUrl.get(this._metaUrl);
        }

        // Create new list
        const list = new SCNGXPlayableList(
            this.httpClient,
            {
                listUrl: this._listUrl,
                metaUrl: this._metaUrl
            }
        );

        // Subscribe to onRelease observable.
        const sub = list.$onReleased.subscribe(() => {
            this.logger.debug("Detected list release. Clearing from registry.")

            // Clear list from the registry.
            PlayableListBuilder.activeListsByMetaUrl.delete(this._metaUrl);
            PlayableListBuilder.activeSubs.delete(list.id);

            sub.unsubscribe();
        })

        // Add list to registry, so it can be used
        // to prevent duplicate lists and recycle them if 
        // its tried to build the same one again.
        PlayableListBuilder.activeListsByMetaUrl.set(this._metaUrl, list);
        PlayableListBuilder.activeSubs.set(list.id, sub);

        return list;
    }

}