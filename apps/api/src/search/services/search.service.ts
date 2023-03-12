import { Injectable, Logger } from '@nestjs/common';
import { MeiliIndex } from '@soundcore/meilisearch';
import { Pageable } from 'nestjs-pager';
import { AlbumMeiliService } from '../../album/services/album-meili.service';
import { Artist } from '../../artist/entities/artist.entity';
import { ArtistMeiliService } from '../../artist/services/artist-meili.service';
import { SongMeiliService } from '../../song/services/song-meili.service';
import { User } from '../../user/entities/user.entity';
import { SearchResult } from '../entities/search-response.entity';

@Injectable()
export class SearchService {
    private readonly logger = new Logger(SearchService.name);

    constructor(
        private readonly artistMeiliService: ArtistMeiliService,
        private readonly albumMeiliService: AlbumMeiliService,
        private readonly songMeiliService: SongMeiliService
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
     * Search artists by a given query
     * @param {string} query Search query
     * @param {Pageable} pageable Page settings
     */
    public async searchArtists(query: string, pageable: Pageable) {
        return this.performGenericSearchQuery(this.artistMeiliService.getIndex(), query, pageable);
    }

    /**
     * Search albums by a given query
     * @param {string} query Search query
     * @param {Pageable} pageable Page settings
     */
    public async searchAlbums(query: string, pageable: Pageable) {
        return this.performGenericSearchQuery(this.albumMeiliService.getIndex(), query, pageable);
    }

    /**
     * Search songs by a given query
     * @param {string} query Search query
     * @param {Pageable} pageable Page settings
     */
    public async searchSongs(query: string, pageable: Pageable) {
        return this.performGenericSearchQuery(this.songMeiliService.getIndex(), query, pageable);
    }

    /**
     * Method that performs a generic search query
     * @param index Meilisearch index to perform query on
     * @param query Query input
     * @param pageable Page settings
     * @returns SearchResult
     */
    private async performGenericSearchQuery<T>(index: MeiliIndex<T>, query: string, pageable: Pageable): Promise<SearchResult<T>> {
        return index.search(query, {
            offset: pageable.offset,
            limit: pageable.limit
        }).catch((error: Error) => {
            this.logger.error(`Failed search query: ${error.message}`, error.stack);
            throw error;
        });
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
