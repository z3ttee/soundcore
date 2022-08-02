import { HttpClient } from "@angular/common/http";
import { Subscription } from "rxjs";
import { BasePlayableList, SCNGXPlayableList } from "../../entities/playable-list.entity";
import { SCNGXPlayableTracklist } from "../../entities/playable-tracklist.entity";
import { SCNGXLogger } from "../logger/logger";

export class PlayableListBuilder {

    /** @internal */
    public static activeListsByUrl = new Map<String, BasePlayableList<any>>();
    /** @internal */
    public static activeSubs = new Map<String, Subscription>();

    public static forPlaylist(httpClient: HttpClient): PlayableListConfigurer<SCNGXPlayableList> {
        return new PlayableListConfigurer<SCNGXPlayableList>(httpClient, true);
    }

    public static forTracklist(httpClient: HttpClient): PlayableListConfigurer<SCNGXPlayableTracklist> {
        return new PlayableListConfigurer<SCNGXPlayableTracklist>(httpClient, false);
    }

}

class PlayableListConfigurer<T> {
    private readonly logger: SCNGXLogger = new SCNGXLogger(PlayableListBuilder.name);

    constructor(
        private readonly _httpClient: HttpClient,
        private readonly _isPlaylist: boolean = false
    ) {}

    private _listUrl: string;

    /**
     * Define endpoint to use to fetch track list.
     * If not defined, the metaUrl is used and /ids is appended.
     * @param url URL to metadata
     * @returns PlayableListBuilder
     */
    public useUrl(url: string): PlayableListConfigurer<T> {
        this._listUrl = url;
        return this;
    }

    public build(): T {
        /**
         * Check if the registry contains a list with the same metaUrl.
         * Return if found, so it can be recycled.
         */
        if(PlayableListBuilder.activeListsByUrl.has(this._listUrl)) {
            const list = PlayableListBuilder.activeListsByUrl.get(this._listUrl);
            this.logger.debug("Found list with same url in registry. Using this one.", list)
            return PlayableListBuilder.activeListsByUrl.get(this._listUrl) as unknown as T;
        }

        // Create new list
        let list: BasePlayableList<any>;

        if(this._isPlaylist) {
            list = new SCNGXPlayableList(this._httpClient, this._listUrl);
        } else {
            list = new SCNGXPlayableTracklist(this._httpClient, this._listUrl);
        }

        // Subscribe to onRelease observable.
        const sub = list.$onReleased.subscribe(() => {
            this.logger.debug("Detected list release. Clearing from registry.")

            // Clear list from the registry.
            PlayableListBuilder.activeListsByUrl.delete(this._listUrl);
            PlayableListBuilder.activeSubs.delete(list.id);

            sub.unsubscribe();
        })

        // Add list to registry, so it can be used
        // to prevent duplicate lists and recycle them if 
        // its tried to build the same one again.
        PlayableListBuilder.activeListsByUrl.set(this._listUrl, list);
        PlayableListBuilder.activeSubs.set(list.id, sub);

        return list as unknown as T;
    }
}