import { Injectable } from '@nestjs/common';
import { Pageable } from 'nestjs-pager';
import { User } from '../user/entities/user.entity';

@Injectable()
export class SearchService {

    constructor(
        // private readonly meiliPlaylist: MeiliPlaylistService,
        // private readonly meiliUser: MeiliUserService,
        // private readonly meiliArtist: MeiliArtistService,
        // private readonly meiliAlbum: MeiliAlbumService,
        // private readonly meiliSong: MeiliSongService,
        // private readonly meiliLabel: MeiliLabelService,
        // private readonly meiliPublisher: MeiliPublisherService,
        // private readonly meiliDistributor: MeiliDistributorService
    ) {}

    /**
     * Search users by a given query
     * @param {string} query Search query
     * @param {Pageable} pageable Page settings
     * @param {User} authentication Authentication object of the request
     * @returns {SearchResponse<MeiliPlaylist>} SearchResponse<MeiliPlaylist>
     */
    public async searchPlaylists(query: string, pageable: Pageable, authentication: User) {
        // return this.meiliPlaylist.searchPlaylists(query, pageable, authentication);
    }

    /**
     * Search users by a given query
     * @param {string} query Search query
     * @param {Pageable} pageable Page settings
     * @returns {SearchResponse<MeiliUser>} SearchResponse<MeiliUser>
     */
    public async searchUsers(query: string, pageable: Pageable) {
        // return this.meiliUser.searchUser(query, pageable);
    }

    /**
     * Search artists by a given query
     * @param {string} query Search query
     * @param {Pageable} pageable Page settings
     * @returns {SearchResponse<MeiliArtist>} SearchResponse<MeiliArtist>
     */
    public async searchArtists(query: string, pageable: Pageable) {
        // return this.meiliArtist.searchArtists(query, pageable);
    }

    /**
     * Search albums by a given query
     * @param {string} query Search query
     * @param {Pageable} pageable Page settings
     * @returns {SearchResponse<MeiliAlbum>} SearchResponse<MeiliAlbum>
     */
    public async searchAlbums(query: string, pageable: Pageable) {
        // return this.meiliAlbum.searchAlbums(query, pageable);
    }

    /**
     * Search songs by a given query
     * @param {string} query Search query
     * @param {Pageable} pageable Page settings
     * @returns {SearchResponse<MeiliSong>} SearchResponse<MeiliSong>
     */
    public async searchSongs(query: string, pageable: Pageable) {
        // return this.meiliSong.searchSongs(query, pageable);
    }

    /**
     * Search labels by a given query
     * @param {string} query Search query
     * @param {Pageable} pageable Page settings
     * @returns {SearchResponse<MeiliLabel>} SearchResponse<MeiliLabel>
     */
    public async searchLabels(query: string, pageable: Pageable) {
        // return this.meiliLabel.searchLabels(query, pageable);
    }

    /**
     * Search publishers by a given query
     * @param {string} query Search query
     * @param {Pageable} pageable Page settings
     * @returns {SearchResponse<MeiliPublisher>} SearchResponse<MeiliPublisher>
     */
    public async searchPublishers(query: string, pageable: Pageable) {
        // return this.meiliPublisher.searchPublishers(query, pageable);
    }

    /**
     * Search distributors by a given query
     * @param {string} query Search query
     * @param {Pageable} pageable Page settings
     * @returns {SearchResponse<MeiliDistributor>} SearchResponse<MeiliDistributor>
     */
    public async searchDistributors(query: string, pageable: Pageable) {
        // return this.meiliDistributor.searchDistributors(query, pageable);
    }

}
