import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Page, BasePageable } from 'nestjs-pager';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { PlaylistItem } from '../../playlist/entities/playlist-item.entity';
import { Song } from '../../song/entities/song.entity';
import { Tracklist, TracklistItem, TracklistType } from '../entities/tracklist.entity';
import { SongService } from '../../song/services/song.service';
import { User } from '../../user/entities/user.entity';
import { LikedSong } from '../../collection/entities/like.entity';
import { LikeService } from '../../collection/services/like.service';

@Injectable()
export class TracklistService {

    constructor(
        private readonly songService: SongService,
        private readonly likeService: LikeService,
        @InjectRepository(PlaylistItem)  private tracklistRepository: Repository<PlaylistItem>
    ) {}

    /**
     * Find a list of song ids by an artist.
     * @param artistId Artist's id
     * @param authentication User authentication object
     * @returns Tracklist
     */
    public async findListByArtist(artistId: string, hostname: string, authentication?: User): Promise<Tracklist> {
        const result = await this.buildFindByArtistQuery(artistId, null, authentication).select(["song.id"]).getManyAndCount();
        const metadataUrl = `${hostname}/v1/tracklists/artist/${artistId}/meta`;
        return new Tracklist(result[1], TracklistType.ARTIST, result[0], metadataUrl);
    }

    /**
     * Find a page of metadata of the tracklist of an artist.
     * @param artistId Artist's id
     * @param pageable Page settings
     * @param authentication User authentication object
     * @returns Page<Song>
     */
    public async findMetaByArtist(artistId: string, pageable: BasePageable, authentication?: User): Promise<Page<Song>> {
        const baseQuery = await this.buildFindByArtistQuery(artistId, pageable, authentication)
        
        const result = await baseQuery.getRawAndEntities();
        const totalElements = await baseQuery.getCount();
        return Page.of(result.entities.map((song, index) => {
            song.streamCount = result.raw[index]?.streamCount || 0
            return song;
        }), totalElements, pageable.offset);   
    }

    /**
     * Find a list of song ids by an artist.
     * @param artistId Artist's id
     * @param authentication User authentication object
     * @returns Tracklist
     */
    public async findListByArtistTop(artistId: string, hostname: string, authentication?: User): Promise<Tracklist> {
        const result = await this.buildFindByArtistTopQuery(artistId, authentication).select(["song.id"]).getMany();
        const metadataUrl = `${hostname}/v1/tracklists/artist/top/${artistId}/meta`;
        return new Tracklist(result.length, TracklistType.ARTIST, result, metadataUrl);
    }

    /**
     * Find a page of metadata of the tracklist of an artist.
     * @param artistId Artist's id
     * @param pageable Page settings
     * @param authentication User authentication object
     * @returns Page<Song>
     */
    public async findMetaByArtistTop(artistId: string, authentication?: User): Promise<Page<Song>> {
        const baseQuery = await this.buildFindByArtistTopQuery(artistId, authentication)
        
        const result = await baseQuery.getRawAndEntities();
        const totalElements = result.entities.length;
        return Page.of(result.entities.map((song, index) => {
            song.streamCount = result.raw[index]?.streamCount || 0
            return song;
        }), totalElements, 0);   
    }

    /**
     * Find a list of song ids by an album.
     * @param albumId Id of the album
     * @param pageable Page settings
     * @param authentication User authentication object
     * @returns Tracklist
     */
    public async findListByAlbum(albumId: string, hostname: string, authentication?: User): Promise<Tracklist> {
        const result = await this.buildFindByAlbumQuery(albumId, null, authentication).select(["song.id"]).getMany();
        const metadataUrl = `${hostname}/v1/tracklists/album/${albumId}/meta`;
        return new Tracklist(result.length, TracklistType.ALBUM, result as unknown as TracklistItem[], metadataUrl);   
    }

    /**
     * Find a page of metadata of the tracklist of an album.
     * @param albumId Id of the album
     * @param pageable Page settings
     * @param authentication User authentication object
     * @returns Page<Song>
     */
    public async findMetaByAlbum(albumId: string, pageable: BasePageable, authentication?: User): Promise<Page<Song>> {
        const baseQuery = await this.buildFindByAlbumQuery(albumId, pageable, authentication)            
        const result = await baseQuery.getRawAndEntities();
        const totalElements = await baseQuery.getCount();
        return Page.of(result.entities.map((song, index) => {
            song.streamCount = result.raw[index]?.streamCount || 0
            return song;
        }), totalElements, pageable.offset);    
    }

    /**
     * Find a list of song ids by an album.
     * @param playlistId Id of the album
     * @param pageable Page settings
     * @param authentication User authentication object
     * @returns Tracklist
     */
    public async findByPlaylist(playlistId: string, hostname: string, authentication?: User): Promise<Tracklist> {
        // TODO: Check if user has access to playlist
        const result = await this.tracklistRepository.createQueryBuilder("item")
            .leftJoin("item.playlist", "playlist")
            .where("playlist.id = :playlistId OR playlist.slug = :playlistId", { playlistId })
            .select(["item.id", "item.createdAt", "item.order"])
            // Playlist order
            .orderBy("item.order", "ASC")
            .addOrderBy("item.createdAt", "ASC")
            .getMany();

        const metadataUrl = `${hostname}/v1/tracklists/playlist/${playlistId}/meta`;
        return new Tracklist(result.length, TracklistType.PLAYLIST, result, metadataUrl);    
    }

    /**
     * Find a page of metadata of the tracklist of an playlist.
     * @param playlistId Id of the playlist
     * @param pageable Page settings
     * @param authentication User authentication object
     * @returns Page<Song>
     */
    public async findMetaByPlaylist(playlistId: string, pageable: BasePageable, authentication?: User): Promise<Page<PlaylistItem>> {
        // TODO: Check if user has access to playlist
        const result = await this.tracklistRepository.createQueryBuilder("item")
            .leftJoin("item.song", "song").addSelect(["song.id", "song.slug", "song.name", "song.duration"])
            .leftJoin("song.artwork", "artwork").addSelect(["artwork.id"])
            .leftJoin("song.album", "album").addSelect(["album.id", "album.slug", "album.name"])
            .leftJoin("song.artwork", "artwork").addSelect(["artwork.id", "artwork.accentColor"])
            .leftJoin("song.primaryArtist", "primaryArtist").addSelect(["primaryArtist.id", "primaryArtist.slug", "primaryArtist.name"])
            .leftJoin("song.featuredArtists", "featuredArtists").addSelect(["featuredArtists.id", "featuredArtists.slug", "featuredArtists.name"])
            .leftJoin("item.addedBy", "addedBy").addSelect(["addedBy.id", "addedBy.slug", "addedBy.name"])
            .leftJoin("item.playlist", "playlist")
            // Has user liked song?
            .loadRelationCountAndMap("song.liked", "song.likes", "likes", (qb) => qb.where("likes.userId = :userId", { userId: authentication?.id }))
            .where("playlist.id = :playlistId OR playlist.slug = :playlistId", { playlistId })
            // Order
            .orderBy("item.order", "ASC")
            .addOrderBy("item.createdAt", "ASC")
            // Pagination
            .skip(pageable.offset)
            .take(pageable.limit)
            .getManyAndCount();

        return Page.of(result[0], result[1], pageable.offset);
    }

    /**
     * Find a list of song ids by users list of liked songs.
     * @param pageable Page settings
     * @param authentication User authentication object
     * @returns Tracklist
     */
    public async findByLikedSongs(authentication: User, hostname: string): Promise<Tracklist> {
        const metadataUrl = `${hostname}/v1/tracklists/liked_songs/meta`;
        const result = await this.likeService.getRepository().createQueryBuilder("like")
            .leftJoin("like.user", "user")
            .leftJoin("like.song", "song")
            .select(["like.id"])
            .orderBy("like.likedAt", "DESC")
            .where("user.id = :userId AND like.type = :type", { userId: authentication.id, type: LikedSong.name })
            .getManyAndCount();

        return new Tracklist(result[1], TracklistType.PLAYLIST, result[0], metadataUrl);    
    }

    /**
     * Find a page of metadata of the tracklist of users liked songs.
     * @param pageable Page settings
     * @param authentication User authentication object
     * @returns Page<Song>
     */
    public async findMetaByLikedSongs(authentication: User, pageable: BasePageable): Promise<Page<LikedSong>> {
        const result = await this.likeService.getRepository().createQueryBuilder("like")
            .leftJoin("like.user", "user").addSelect(["user.id", "user.slug", "user.name"])
            .leftJoin("user.artwork", "ua").addSelect(["ua.id"])
            .leftJoin("like.song", "song").addSelect(["song.id", "song.slug", "song.name", "song.explicit", "song.duration"])
            .leftJoin("song.artwork", "artwork").addSelect(["artwork.id"])
            .leftJoin("song.album", "album").addSelect(["album.id", "album.slug", "album.name"])
            .leftJoin("song.primaryArtist", "primaryArtist").addSelect(["primaryArtist.id", "primaryArtist.slug", "primaryArtist.name"])
            .leftJoin("song.featuredArtists", "featuredArtists").addSelect(["featuredArtists.id", "featuredArtists.slug", "featuredArtists.name"])
            .loadRelationCountAndMap("song.liked", "song.likes", "likes", (qb) => qb.where("likes.userId = :userId", { userId: authentication?.id }))
            .orderBy("like.likedAt", "DESC")
            .take(pageable.limit)
            .skip(pageable.offset)
            .where("user.id = :userId AND like.type = :type", { userId: authentication.id, type: LikedSong.name })
            .getManyAndCount();

        return Page.of(result[0], result[1], pageable.offset);
    }

    /**
     * Build the general sql query for findListByArtist()
     * and findMetaByArtist(). This is a shared query to make
     * maintaining the code easier.
     * @param artistId Artist's id
     * @param pageable Page settings. Set null for tracklists as this is only required for metadata endpoints.
     * @param authentication 
     * @returns SelectQueryBuilder<Song>
     */
    protected buildFindByArtistQuery(artistId: string, pageable?: BasePageable, authentication?: User): SelectQueryBuilder<Song> {
        const query = this.songService.buildGeneralQuery("song", authentication)
            // Get amount of streams
            .loadRelationCountAndMap('song.streamCount', 'song.streams', 'streamCount')

            // Order by date of release or creation in database
            .orderBy('song.releasedAt', 'DESC')
            .addOrderBy("song.createdAt", "DESC")

            .where("primaryArtist.id = :artistId OR primaryArtist.slug = :artistId", { artistId })

        // Add optional page settings
        if(!!pageable) {
            query.skip(pageable.offset).take(pageable.limit)
        }

        return query;
    }

    /**
     * Build the general sql query for findListByArtistTop()
     * and findMetaByArtistTop(). This is a shared query to make
     * maintaining the code easier.
     * @param artistId Artist's id
     * @param alias Song entity alias in SQL
     * @param authentication 
     * @returns SelectQueryBuilder<Song>
     */
    protected buildFindByArtistTopQuery(artistId: string, authentication?: User): SelectQueryBuilder<Song> {
        const query = this.songService.buildGeneralQuery("song", authentication)
            // Get amount of streams
            // TODO: To be optimised using selectAndMap in next TypeORM release
            // If this has landed, this row can actually be moved to buildGeneralQuery()
            // .leftJoin('song.streams', 'streams').addSelect("SUM(IFNULL(streams.streamCount, 0)) AS song_streamCount")
            // .loadRelationCountAndMap("song.streamCount", "song.streams", "streamsCount")
            .leftJoin("song.streams", "streams")
            .leftJoin("song.likes", "likes")//.addSelect("COUNT(likedByAll.id) AS likedByAllCount")

            // Order by date of release or creation in database
            // .orderBy('song_streamCount', 'DESC')
            // .addOrderBy('likedByAllCount', "DESC")

            .orderBy("COUNT(streams.id)", "DESC")
            .addOrderBy("COUNT(likes.id)", "DESC")

            .groupBy("song.id")
            .limit(5)
            .where("primaryArtist.id = :artistId OR primaryArtist.slug = :artistId", { artistId })

        return query;
    }

    /**
     * Build the general sql query for findListByAlbum()
     * and findMetaByAlbum(). This is a shared query to make
     * maintaining the code easier.
     * @param albumId Album's id
     * @param alias Song entity alias in SQL
     * @param pageable Page settings. Set null for tracklists as this is only required for metadata endpoints.
     * @param authentication 
     * @returns SelectQueryBuilder<Song>
     */
    protected buildFindByAlbumQuery(albumId: string, pageable?: BasePageable, authentication?: User): SelectQueryBuilder<Song> {
        let query = this.songService.buildGeneralQuery("song", authentication)
            // Get amount of streams
            // If this has landed, this row can actually be moved to buildGeneralQuery()
            // .leftJoin('song.streams', 'streams').addSelect(["SUM(IFNULL(streams.streamCount, 0)) AS streamCount"])
            // Order songs by album order
            .orderBy(`song.order`, "ASC")
            .where("album.id = :albumId OR album.slug = :albumId", { albumId })

        // Add optional page settings
        if(!!pageable) {
            query = query.skip(pageable.offset).take(pageable.limit)
        }

        return query;
    }

    /**
     * Build the general sql query for findListByPlaylist()
     * and findMetaByPlaylist(). This is a shared query to make
     * maintaining the code easier.
     * @param playlistId Playlist's id
     * @param alias Song entity alias in SQL
     * @param pageable Page settings. Set null for tracklists as this is only required for metadata endpoints.
     * @param authentication 
     * @returns SelectQueryBuilder<Song>
     */
     protected buildFindByPlaylistQuery(playlistId: string, alias: string, pageable?: BasePageable, authentication?: User): SelectQueryBuilder<Song> {
        const query = this.songService.buildGeneralQuery(alias, authentication)
            // Get amount of streams
            // TODO: To be optimised using selectAndMap in next TypeORM release
            // If this has landed, this row can actually be moved to buildGeneralQuery()
            .leftJoin('song.streams', 'streams').addSelect(["SUM(IFNULL(streams.streamCount, 0)) AS streamCount"])
            .leftJoin("song.playlists", "item").addSelect(["item.order", "item.createdAt"])
            .leftJoin("song.primaryArtist", "primaryArtist").addSelect(["primaryArtist.id", "primaryArtist.slug", "primaryArtist.name"])
            .leftJoin("item.playlist", "playlist")

            .orderBy("item.order", "ASC")
            .addOrderBy("item.createdAt", "ASC")

            .groupBy("song.id")
            .addGroupBy("item.order")
            .addGroupBy("item.createdAt")

            .where("playlist.id = :playlistId OR playlist.slug = :playlistId", { playlistId })

        // Add optional page settings
        if(!!pageable) {
            query.skip(pageable.offset).take(pageable.limit)
        }

        return query;
    }

}
