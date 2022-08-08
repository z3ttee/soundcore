import { Injectable } from "@nestjs/common";
import MeiliSearch, { SearchResponse, Task } from "meilisearch";
import { Pageable } from "nestjs-pager";
import { Album } from "../../album/entities/album.entity";
import { MeiliAlbum } from "../entities/meili-album.entity";
import { MeiliArtwork } from "../entities/meili-artwork.entity";
import { MEILI_INDEX_ALBUM } from "../meilisearch.constants";
import { MeiliService } from "./meili.service";

@Injectable()
export class MeiliAlbumService extends MeiliService<MeiliAlbum> {

    constructor(client: MeiliSearch) {
        super(client, MEILI_INDEX_ALBUM, {
            searchableAttributes: ["name", "primaryArtist.name"]
        })
    }

    /**
     * Add or update album document in meilisearch instance.
     * @param {Album} albums Album data
     * @param {number} timeOutMs (Optional) Timeout for checking task completion
     * @returns {Task} Task
     */
    public async setAlbums(albums: Album[], timeOutMs?: number): Promise<Task> {
        return this.sync(albums.map((album) => ({
            id: album.id,
            name: album.name,
            slug: album.slug,
            resourceType: album.resourceType,
            artwork: album.artwork ? new MeiliArtwork(album.artwork?.id) : null,
            createdAt: album.createdAt,
            releasedAt: album.releasedAt,
            primaryArtist: {
                id: album.primaryArtist.id,
                name: album.primaryArtist.name,
                artwork: null,
                resourceType: album.primaryArtist.resourceType,
                slug: album.primaryArtist.slug
            }
        })), timeOutMs);
    }

    /**
     * Delete an artist document from meilisearch.
     * @param {string} albumId Artist's id
     * @param {number} timeOutMs (Optional) Timeout for checking task completion
     * @returns {Task} Task
     */
    public async deleteAlbum(albumId: string, timeOutMs?: number): Promise<Task> {
        return this.delete(albumId, timeOutMs);
    }

    /**
     * Search for artist.
     * @param {string} query Search query
     * @param {Pageable} pageable Page settings
     * @returns {SearchResponse} SearchResponse<MeiliArtist>
     */
    public async searchAlbums(query: string, pageable: Pageable): Promise<SearchResponse<MeiliAlbum>> {
        return this.search(query, {
            attributesToRetrieve: ["*"],
            limit: pageable.size,
            offset: pageable.size * pageable.page,
            showMatchesPosition: true,
        })
    }

}