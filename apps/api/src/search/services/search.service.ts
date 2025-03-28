import { Injectable, Logger } from '@nestjs/common';
import { Pageable } from '@soundcore/common';
import { MeiliIndex } from '@repo/meilisearch';
import { User } from '../../user/entities/user.entity';
import { SearchResult } from '../entities/search-response.entity';
import { SearchEngine } from '../engines/engine';

@Injectable()
export class SearchService {
    private readonly logger = new Logger(SearchService.name);

    constructor(
        private readonly _searchEngine: SearchEngine,
        // private readonly artistMeiliService: ArtistMeiliService,
        // private readonly songMeiliService: SongMeiliService
        // private readonly meiliPlaylist: MeiliPlaylistService,
        // private readonly meiliUser: MeiliUserService,
        // private readonly meiliArtist: MeiliArtistService,
        // private readonly meiliAlbum: MeiliAlbumService,
        // private readonly meiliSong: MeiliSongService,
        // private readonly meiliLabel: MeiliLabelService,
        // private readonly meiliPublisher: MeiliPublisherService,
        // private readonly meiliDistributor: MeiliDistributorService
    ) { }

    /**
     * Search artists by a given query
     * @param {string} query Search query
     * @param {Pageable} pageable Page settings
     */
    public async searchArtists(query: string, pageable: Pageable) {
        return this._searchEngine.searchAllArtists(query, pageable);
        // return this.performGenericSearchQuery(this.artistMeiliService.getIndex(), query, pageable);
    }

    /**
     * Search albums by a given query
     * @param {string} query Search query
     * @param {Pageable} pageable Page settings
     */
    public async searchAlbums(query: string, pageable: Pageable) {
        return this._searchEngine.searchAllAlbums(query, pageable);
        // return this.performGenericSearchQuery(this.albumMeiliService.getIndex(), query, pageable);
    }

    /**
     * Search songs by a given query
     * @param {string} query Search query
     * @param {Pageable} pageable Page settings
     */
    public async searchSongs(query: string, pageable: Pageable) {
        return this._searchEngine.searchAllSongs(query, pageable);
        // return this.performGenericSearchQuery(this.songMeiliService.getIndex(), query, pageable);
    }

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
