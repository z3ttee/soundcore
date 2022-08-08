import { Injectable } from "@nestjs/common";
import MeiliSearch, { SearchResponse, Task } from "meilisearch";
import { Pageable } from "nestjs-pager";
import { Song } from "../../song/entities/song.entity";
import { MeiliArtwork } from "../entities/meili-artwork.entity";
import { MeiliSong } from "../entities/meili-song.entity";
import { MEILI_INDEX_SONG } from "../meilisearch.constants";
import { MeiliService } from "./meili.service";

@Injectable()
export class MeiliSongService extends MeiliService<MeiliSong> {

    constructor(client: MeiliSearch) {
        super(client, MEILI_INDEX_SONG, {
            searchableAttributes: ["name", "primaryArtist.name", "featuredArtists.name", "genre.name", "album.name"]
        })
    }

    /**
     * Add or update song document in meilisearch instance.
     * @param {Album} songs Song data
     * @param {number} timeOutMs (Optional) Timeout for checking task completion
     * @returns {Task} Task
     */
    public async setSongs(songs: Song[], timeOutMs?: number): Promise<Task> {
        return this.sync(songs.map((song) => {

            const result: MeiliSong = {
                id: song.id,
                name: song.name,
                slug: song.slug,
                resourceType: song.resourceType,
                artwork: song.artwork ? new MeiliArtwork(song.artwork?.id) : null,
                explicit: song.explicit,
                available: !!song.file,
                duration: song.duration,
                createdAt: song.createdAt,
                releasedAt: song.releasedAt,
                album: null,
                primaryArtist: null,
                featuredArtists: [],
                genres: []
            }
    
            if(song.album) {
                result.album = {
                    id: song.album.id,
                    name: song.album.name,
                    slug: song.album.slug,
                    resourceType: song.album.resourceType,
                    artwork: null,
                    createdAt: null,
                    primaryArtist: null,
                    releasedAt: null
                }
            }
    
            if(song.primaryArtist) {
                result.primaryArtist = {
                    id: song.primaryArtist.id,
                    slug: song.primaryArtist.slug,
                    name: song.primaryArtist.name,
                    artwork: null,
                    resourceType: song.primaryArtist.resourceType
                }
            }
    
            if(song.featuredArtists) {
                result.featuredArtists = song.featuredArtists.map((artist) => ({
                    id: artist.id,
                    slug: artist.slug,
                    name: artist.name,
                    artwork: null,
                    resourceType: artist.resourceType
                }));
            }
    
            if(song.genres) {
                result.genres = song.genres.map((genre) => ({
                    id: genre.id,
                    slug: genre.slug,
                    name: genre.name,
                    resourceType: genre.resourceType
                }));
            }

            return result;
        }), timeOutMs);
    }

    /**
     * Delete an artist document from meilisearch.
     * @param {string} songId Artist's id
     * @param {number} timeOutMs (Optional) Timeout for checking task completion
     * @returns {Task} Task
     */
    public async deleteSong(songId: string, timeOutMs?: number): Promise<Task> {
        return this.delete(songId, timeOutMs);
    }

    /**
     * Search for artist.
     * @param {string} query Search query
     * @param {Pageable} pageable Page settings
     * @returns {SearchResponse} SearchResponse<MeiliArtist>
     */
    public async searchSongs(query: string, pageable: Pageable): Promise<SearchResponse<MeiliSong>> {
        return this.search(query, {
            attributesToRetrieve: ["*"],
            limit: pageable.size,
            offset: pageable.size * pageable.page,
            showMatchesPosition: true,
        })
    }

}