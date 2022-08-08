import { Injectable } from "@nestjs/common";
import MeiliSearch, { SearchResponse, Task } from "meilisearch";
import { Pageable } from "nestjs-pager";
import { Distributor } from "../../distributor/entities/distributor.entity";
import { MeiliArtwork } from "../entities/meili-artwork.entity";
import { MeiliDistributor } from "../entities/meili-distributor.entity";
import { MEILI_INDEX_DISTRIBUTOR } from "../meilisearch.constants";
import { MeiliService } from "./meili.service";

@Injectable()
export class MeiliDistributorService extends MeiliService<MeiliDistributor> {

    constructor(client: MeiliSearch) {
        super(client, MEILI_INDEX_DISTRIBUTOR, {
            searchableAttributes: ["name"]
        })
    }

    /**
     * Add or update distributor document in meilisearch instance.
     * @param {Distributor} distributors Distributor data
     * @param {number} timeOutMs (Optional) Timeout for checking task completion
     * @returns {Task} Task
     */
    public async setDistributors(distributors: Distributor[], timeOutMs?: number): Promise<Task> {
        return this.sync(distributors.map((distributor) => ({
            id: distributor.id,
            name: distributor.name,
            slug: distributor.slug,
            resourceType: distributor.resourceType,
            artwork: distributor.artwork ? new MeiliArtwork(distributor.artwork?.id) : null
        })), timeOutMs);
    }

    /**
     * Delete a distributor document from meilisearch.
     * @param {string} distributorId Distributor's id
     * @param {number} timeOutMs (Optional) Timeout for checking task completion
     * @returns {Task} Task
     */
    public async deleteDistributor(distributorId: string, timeOutMs?: number): Promise<Task> {
        return this.delete(distributorId, timeOutMs);
    }

    /**
     * Search for distributor.
     * @param {string} query Search query
     * @param {Pageable} pageable Page settings
     * @returns {SearchResponse} SearchResponse<MeiliDistributor>
     */
    public async searchDistributors(query: string, pageable: Pageable): Promise<SearchResponse<MeiliDistributor>> {
        return this.search(query, {
            attributesToRetrieve: ["*"],
            limit: pageable.size,
            offset: pageable.size * pageable.page,
            showMatchesPosition: true,
        })
    }

}