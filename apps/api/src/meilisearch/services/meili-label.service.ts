import { Injectable } from "@nestjs/common";
import MeiliSearch, { SearchResponse, Task } from "meilisearch";
import { Pageable } from "nestjs-pager";
import { Label } from "../../label/entities/label.entity";
import { MeiliArtwork } from "../entities/meili-artwork.entity";
import { MeiliLabel } from "../entities/meili-label.entity";
import { MEILI_INDEX_LABEL } from "../meilisearch.constants";
import { MeiliService } from "./meili.service";

@Injectable()
export class MeiliLabelService extends MeiliService<MeiliLabel> {

    constructor(client: MeiliSearch) {
        super(client, MEILI_INDEX_LABEL, {
            searchableAttributes: ["name"]
        })
    }

    /**
     * Add or update label document in meilisearch instance.
     * @param {Label[]} labels Label data
     * @param {number} timeOutMs (Optional) Timeout for checking task completion
     * @returns {Task} Task
     */
    public async setLabels(labels: Label[], timeOutMs?: number): Promise<Task> {
        return this.sync(labels.map((label) => ({
            id: label.id,
            name: label.name,
            slug: label.slug,
            resourceType: label.resourceType,
            artwork: label.artwork ? new MeiliArtwork(label.artwork?.id) : null
        })), timeOutMs);
    }

    /**
     * Delete a label document from meilisearch.
     * @param {string} labelId Label's id
     * @param {number} timeOutMs (Optional) Timeout for checking task completion
     * @returns {Task} Task
     */
    public async deleteLabel(labelId: string, timeOutMs?: number): Promise<Task> {
        return this.delete(labelId, timeOutMs);
    }

    /**
     * Search for label.
     * @param {string} query Search query
     * @param {Pageable} pageable Page settings
     * @returns {SearchResponse} SearchResponse<MeiliLabel>
     */
    public async searchLabels(query: string, pageable: Pageable): Promise<SearchResponse<MeiliLabel>> {
        return this.search(query, {
            attributesToRetrieve: ["*"],
            limit: pageable.size,
            offset: pageable.size * pageable.page,
            showMatchesPosition: true,
        })
    }

}