import { Injectable } from "@nestjs/common";
import MeiliSearch, { SearchResponse, Task } from "meilisearch";
import { Pageable } from "nestjs-pager";
import { Playlist } from "../../playlist/entities/playlist.entity";
import { PlaylistPrivacy } from "../../playlist/enums/playlist-privacy.enum";
import { User } from "../../user/entities/user.entity";
import { MeiliArtwork } from "../entities/meili-artwork.entity";
import { MeiliPlaylist } from "../entities/meili-playlist.entity";
import { MEILI_INDEX_PLAYLIST } from "../meilisearch.constants";
import { MeiliService } from "./meili.service";

@Injectable()
export class MeiliPlaylistService extends MeiliService<MeiliPlaylist> {

    constructor(client: MeiliSearch) {
        super(client, MEILI_INDEX_PLAYLIST, {
            filterableAttributes: ["privacy", "author.id"],
            searchableAttributes: ["name", "author.name"]
        })
    }

    /**
     * Add or update playlist document in meilisearch instance.
     * @param {Playlist} playlists Playlist data
     * @param {number} timeOutMs (Optional) Timeout for checking task completion
     * @returns {Task} Task
     */
    public async setPlaylists(playlists: Playlist[], timeOutMs?: number): Promise<Task> {
        return this.sync(playlists.map((playlist) => ({
            id: playlist.id,
            name: playlist.name,
            slug: playlist.slug,
            resourceType: playlist.resourceType,
            createdAt: playlist.createdAt,
            description: playlist.description,
            artwork: playlist.artwork ? new MeiliArtwork(playlist.artwork?.id) : null,
            privacy: playlist.privacy,
            flag: playlist.flag,
            author: {
                id: playlist.author.id,
                name: playlist.author.name,
                slug: playlist.author.slug,
                accentColor: playlist.author.accentColor,
                resourceType: playlist.author.resourceType,
                artwork: playlist.author.artwork ? new MeiliArtwork(playlist.author.artwork?.id) : null
            }
        })), timeOutMs);
    }

    /**
     * Delete a playlist document from meilisearch.
     * @param {string} playlistId Playlist's id
     * @param {number} timeOutMs (Optional) Timeout for checking task completion
     * @returns {Task} Task
     */
    public async deletePlaylist(playlistId: string, timeOutMs?: number): Promise<Task> {
        return this.delete(playlistId, timeOutMs);
    }

    /**
     * Search for playlist.
     * @param {string} query Search query
     * @param {Pageable} pageable Page settings
     * @param {User} authentication Authentication object
     * @returns {SearchResponse} SearchResponse<MeiliPlaylist>
     */
    public async searchPlaylists(query: string, pageable: Pageable, authentication: User): Promise<SearchResponse<MeiliPlaylist>> {
        return this.search(query, {
            attributesToRetrieve: ["*"],
            limit: pageable.size,
            offset: pageable.size * pageable.page,
            showMatchesPosition: true,
            filter: `privacy = '${PlaylistPrivacy.PUBLIC}' OR author.id = '${authentication.id}'`
        })
    }

}