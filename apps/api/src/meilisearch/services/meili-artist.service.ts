import { Injectable } from "@nestjs/common";
import MeiliSearch, { SearchResponse, Task } from "meilisearch";
import { Pageable } from "nestjs-pager";
import { Artist } from "../../artist/entities/artist.entity";
import { MeiliArtist } from "../entities/meili-artist.entity";
import { MeiliArtwork } from "../entities/meili-artwork.entity";
import { MEILI_INDEX_ARTIST } from "../meilisearch.constants";
import { MeiliService } from "./meili.service";

@Injectable()
export class MeiliArtistService extends MeiliService<MeiliArtist> {

    constructor(client: MeiliSearch) {
        super(client, MEILI_INDEX_ARTIST, {
            searchableAttributes: ["name"]
        })
    }

    /**
     * Add or update artist document in meilisearch instance.
     * @param {Artist} artist Artist data
     * @param {number} timeOutMs (Optional) Timeout for checking task completion
     * @returns {Task} Task
     */
    public async setArtists(artists: Artist[], timeOutMs?: number): Promise<Task> {
        return this.sync(artists.map((artist) => ({
            id: artist.id,
            name: artist.name,
            slug: artist.slug,
            resourceType: artist.resourceType,
            artwork: artist.artwork ? new MeiliArtwork(artist.artwork?.id) : null
        })), timeOutMs);
    }

    /**
     * Delete an artist document from meilisearch.
     * @param {string} artistId Artist's id
     * @param {number} timeOutMs (Optional) Timeout for checking task completion
     * @returns {Task} Task
     */
    public async deleteArtist(artistId: string, timeOutMs?: number): Promise<Task> {
        return this.delete(artistId, timeOutMs);
    }

    /**
     * Search for artist.
     * @param {string} query Search query
     * @param {Pageable} pageable Page settings
     * @returns {SearchResponse} SearchResponse<MeiliArtist>
     */
    public async searchArtists(query: string, pageable: Pageable): Promise<SearchResponse<MeiliArtist>> {
        return this.search(query, {
            attributesToRetrieve: ["*"],
            limit: pageable.size,
            offset: pageable.size * pageable.page,
            showMatchesPosition: true,
        })
    }

}