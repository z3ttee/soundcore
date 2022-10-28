import { Controller, Get, Param } from '@nestjs/common';
import { Page, Pageable, Pagination } from 'nestjs-pager';
import { Authentication } from '../../authentication/decorators/authentication.decorator';
import { Hostname } from '../../hostname/decorator/hostname.decorator';
import { PlaylistItem } from '../../playlist/entities/playlist-item.entity';
import { User } from '../../user/entities/user.entity';
import { Song } from '../entities/song.entity';
import { Tracklist } from '../entities/tracklist.entity';
import { TracklistService } from '../services/tracklist.service';

/**
 * Controller class that contains
 * endpoints for handling tracklists.
 */
@Controller('tracklist')
export class TracklistController {
    constructor(private readonly service: TracklistService) {}

    /**
     * Endpoint for building a list of tracks of an artist
     * filled with only ids.
     * @param artistId Artist's id
     * @param authentication Authentication object
     * @returns Tracklist
     */
    @Get("/artist/top/:artistId")
    public async findListByArtistTop(@Param("artistId") artistId: string, @Authentication() authentication: User, @Hostname() hostname: string): Promise<Tracklist> {
        return this.service.findListByArtistTop(artistId, hostname, authentication);
    }
 
     /**
      * Metadata endpoint of /artist/top/:artistId
      * @param artistId Artist's id
      * @param authentication Authentication object
      * @returns Page<Song>
      */
    @Get("/artist/top/:artistId/meta")
    public async findMetaByArtistTop(@Param("artistId") artistId: string, @Authentication() authentication: User): Promise<Page<Song>> {
        return this.service.findMetaByArtistTop(artistId, authentication);
    }

    /**
     * Endpoint for building a list of tracks of an artist
     * filled with only ids.
     * @param artistId Artist's id
     * @param authentication Authentication object
     * @returns Tracklist
     */
    @Get("/artist/:artistId")
    public async findListByArtist(@Param("artistId") artistId: string, @Authentication() authentication: User, @Hostname() hostname: string): Promise<Tracklist> {
        return this.service.findListByArtist(artistId, hostname, authentication)
    }

    /**
     * Metadata endpoint of /artist/:artistId
     * @param artistId Artist's id
     * @param pageable Page settings
     * @param authentication Authentication object
     * @returns Page<Song>
     */
    @Get("/artist/:artistId/meta")
    public async findMetaByArtist(@Param("artistId") artistId: string, @Pagination() pageable: Pageable, @Authentication() authentication: User): Promise<Page<Song>> {
        return this.service.findMetaByArtist(artistId, pageable, authentication);
    }

    /**
     * Endpoint for building a list of tracks of an album
     * filled with only ids.
     * @param albumId Album's id
     * @param authentication Authentication object
     * @returns Tracklist
     */
    @Get("/album/:albumId")
    public async findListByAlbum(@Param("albumId") albumId: string, @Authentication() authentication: User, @Hostname() hostname: string): Promise<Tracklist> {
        return this.service.findListByAlbum(albumId, hostname, authentication);
    }

    /**
     * Metadata endpoint of /album/:albumId
     * @param albumId Album's id
     * @param pageable Page settings
     * @param authentication Authentication object
     * @returns Page<Song>
     */
    @Get("/album/:albumId/meta")
    public async findMetaByAlbum(@Param("albumId") albumId: string, @Pagination() pageable: Pageable, @Authentication() authentication: User): Promise<Page<Song>> {
        return this.service.findMetaByAlbum(albumId, pageable, authentication);
    }

    /**
     * Endpoint for building a list of tracks of a playlist
     * filled with only ids.
     * @param playlistId Playlist's id
     * @param authentication Authentication object
     * @returns Tracklist
     */
    @Get("/playlist/:playlistId")
    public async findListByPlaylist(@Param("playlistId") playlistId: string, @Authentication() authentication: User, @Hostname() hostname: string): Promise<Tracklist> {
        return this.service.findListByPlaylist(playlistId, hostname, authentication);
    }

    /**
     * Metadata endpoint of /playlist/:playlistId
     * @param playlistId Playlist's id
     * @param pageable Page settings
     * @param authentication Authentication object
     * @returns Page<Song>
     */
    @Get("/playlist/:playlistId/meta")
    public async findMetaByPlaylist(@Param("playlistId") playlistId: string, @Pagination() pageable: Pageable, @Authentication() authentication: User): Promise<Page<PlaylistItem>> {
        return this.service.findMetaByPlaylist(playlistId, pageable, authentication);
    }

}
