import { Injectable } from "@nestjs/common";
import MeiliSearch, { SearchResponse, Task } from "meilisearch";
import { Pageable } from "nestjs-pager";
import { Publisher } from "../../publisher/entities/publisher.entity";
import { MeiliArtwork } from "../entities/meili-artwork.entity";
import { MeiliPublisher } from "../entities/meili-publisher.entity";
import { MEILI_INDEX_PUBLISHER } from "../meilisearch.constants";
import { MeiliService } from "./meili.service";

@Injectable()
export class MeiliPublisherService extends MeiliService<MeiliPublisher> {

    constructor(client: MeiliSearch) {
        super(client, MEILI_INDEX_PUBLISHER, {
            searchableAttributes: ["name"]
        })
    }

    /**
     * Add or update publisher document in meilisearch instance.
     * @param {Publisher} publishers Publisher data
     * @param {number} timeOutMs (Optional) Timeout for checking task completion
     * @returns {Task} Task
     */
    public async setPublishers(publishers: Publisher[], timeOutMs?: number): Promise<Task> {
        return this.sync(publishers.map((publisher) => ({
            id: publisher.id,
            name: publisher.name,
            slug: publisher.slug,
            resourceType: publisher.resourceType,
            artwork: publisher.artwork ? new MeiliArtwork(publisher.artwork?.id) : null
        })), timeOutMs);
    }

    /**
     * Delete a publisher document from meilisearch.
     * @param {string} publisherId Publisher's id
     * @param {number} timeOutMs (Optional) Timeout for checking task completion
     * @returns {Task} Task
     */
    public async deletePublisher(publisherId: string, timeOutMs?: number): Promise<Task> {
        return this.delete(publisherId, timeOutMs);
    }

    /**
     * Search for publishers.
     * @param {string} query Search query
     * @param {Pageable} pageable Page settings
     * @returns {SearchResponse} SearchResponse<MeiliPublisher>
     */
    public async searchPublishers(query: string, pageable: Pageable): Promise<SearchResponse<MeiliPublisher>> {
        return this.search(query, {
            attributesToRetrieve: ["*"],
            limit: pageable.size,
            offset: pageable.size * pageable.page,
            showMatchesPosition: true,
        })
    }

}