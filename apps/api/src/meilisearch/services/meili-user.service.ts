import { Injectable } from "@nestjs/common";
import MeiliSearch, { SearchResponse, Task } from "meilisearch";
import { Pageable } from "nestjs-pager";
import { User } from "../../user/entities/user.entity";
import { MeiliArtwork } from "../entities/meili-artwork.entity";
import { MeiliUser } from "../entities/meili-user.entity";
import { MEILI_INDEX_USER } from "../meilisearch.constants";
import { MeiliService } from "./meili.service";

@Injectable()
export class MeiliUserService extends MeiliService<MeiliUser> {

    constructor(client: MeiliSearch) {
        super(client, MEILI_INDEX_USER, {
            searchableAttributes: ["name"]
        })
    }

    /**
     * Add or update user document in meilisearch instance.
     * @param {User} users User data
     * @param {number} timeOutMs (Optional) Timeout for checking task completion
     * @returns {Task} Task
     */
    public async setUsers(users: User[], timeOutMs?: number): Promise<Task> {
        return this.sync(users.map((user) => ({
            id: user.id,
            name: user.name,
            slug: user.slug,
            resourceType: user.resourceType,
            artwork: user.artwork ? new MeiliArtwork(user.artwork.id) : null,
            accentColor: user.accentColor
        })), timeOutMs);
    }

    /**
     * Delete a user document from meilisearch.
     * @param {string} userId User's id
     * @param {number} timeOutMs (Optional) Timeout for checking task completion
     * @returns {Task} Task
     */
    public async deleteUser(userId: string, timeOutMs?: number): Promise<Task> {
        return this.delete(userId, timeOutMs);
    }

    /**
     * Search for users.
     * @param {string} query Search query
     * @param {Pageable} pageable Page settings
     * @returns {SearchResponse<MeiliUser>} SearchResponse<MeiliUser>
     */
    public async searchUser(query: string, pageable: Pageable): Promise<SearchResponse<MeiliUser>> {
        return this.search(query, {
            attributesToRetrieve: ["*"],
            limit: pageable.size,
            offset: pageable.size * pageable.page,
            showMatchesPosition: true
        })
    }

}