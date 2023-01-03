import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Page, Pageable } from 'nestjs-pager';
import { Repository } from 'typeorm';
import { Album } from '../../album/entities/album.entity';
import { Playlist } from '../../playlist/entities/playlist.entity';
import { PlaylistPrivacy } from '../../playlist/enums/playlist-privacy.enum';
import { PlaylistService } from '../../playlist/playlist.service';
import { Song } from '../../song/entities/song.entity';
import { User } from '../../user/entities/user.entity';
import { ToggleLikedSongDTO } from '../dtos/toggle-result.dto';
import { LikedAlbum, LikedPlaylist, LikedResource, LikedSong } from '../entities/like.entity';

@Injectable()
export class LikeService {

    constructor(
        private playlistService: PlaylistService,
        @InjectRepository(LikedResource) private repository: Repository<LikedResource>,
        @InjectRepository(LikedSong) private likedSongRepository: Repository<LikedSong>

    ) {}

    public getRepository() {
        return this.repository;
    }

    /**
     * Find like informations for a userId and songId
     * @param userId User's id
     * @param songId Song's id
     * @returns LikedSong
     */
    public async findByUserAndSong(userId: string, songId: string): Promise<LikedSong> {
        return this.likedSongRepository.createQueryBuilder("like")
            .leftJoin("like.user", "user")
            .leftJoinAndSelect("like.song", "song")
            .leftJoin("song.album", "album").addSelect(["album.id", "album.slug", "album.name"])
            .leftJoin("song.primaryArtist", "primaryArtist").addSelect(["primaryArtist.id", "primaryArtist.slug", "primaryArtist.name"])
            .leftJoin("song.featuredArtists", "featuredArtists").addSelect(["featuredArtists.id", "featuredArtists.slug", "featuredArtists.name"])
            .leftJoin("song.artwork", "artwork").addSelect(["artwork.id"])
            .where("user.id = :userId AND song.id = :songId", { userId, songId })
            .getOne();
    }

    /**
     * Find like informations for a userId and playlistId
     * @param userId User's id
     * @param playlistId Playlist's id
     * @returns LikedPlaylist
     */
    public async findByUserAndPlaylist(userId: string, playlistId: string): Promise<LikedPlaylist> {
        return this.repository.createQueryBuilder("like")
            .leftJoin("like.user", "user")
            .leftJoinAndSelect("like.playlist", "playlist")
            .where("user.id = :userId AND playlist.id = :playlistId", { userId, playlistId })
            .getOne();
    }

    /**
     * Find like informations for a userId and albumId
     * @param userId User's id
     * @param albumId Album's id
     * @returns LikedAlbum
     */
    public async findByUserAndAlbum(userId: string, albumId: string): Promise<LikedAlbum> {
        return this.repository.createQueryBuilder("like")
            .leftJoin("like.user", "user")
            .leftJoinAndSelect("like.album", "album")
            .where("user.id = :userId AND album.id = :albumId", { userId, albumId })
            .getOne();
    }

    public async findPageByLikedSongsOfUser(userId: string, pageable: Pageable): Promise<Page<LikedSong>> {
        return this.repository.createQueryBuilder("like")
            .leftJoin("like.user", "user")
            .leftJoin("like.song", "song").addSelect(["song.id", "song.slug", "song.name", "song.duration", "song.releasedAt", "song.explicit"])
            .leftJoin("song.album", "album").addSelect(["album.id", "album.slug", "album.name"])
            .leftJoin("song.primaryArtist", "primaryArtist").addSelect(["primaryArtist.id", "primaryArtist.slug", "primaryArtist.name"])
            .leftJoin("song.featuredArtists", "featuredArtists").addSelect(["featuredArtists.id", "featuredArtists.slug", "featuredArtists.name"])
            .leftJoin("song.artwork", "artwork").addSelect(["artwork.id"])
            .take(pageable.limit)
            .skip(pageable.offset)
            .where("user.id = :userId AND song.id != NULL", { userId })
            .getManyAndCount().then(([resources, total]) => Page.of(resources, total, pageable.offset));
    }

    /**
     * Check if a user is the author of a playlist
     * @param userId User's id
     * @param playlistId Playlist's id
     * @returns True or False
     */
    public async isPlaylistAuthor(userId: string, playlistId: string): Promise<boolean> {
        return this.repository.createQueryBuilder("like")
            .leftJoin("like.user", "user")
            .leftJoin("like.playlist", "playlist")
            .leftJoin("playlist.author", "author")
            .where("playlist.id = :playlistId AND author.id = :authorId", { playlistId, authorId: userId })
            .getCount().then((count) => count > 0);
    }

    /**
     * Toggle like state of a song.
     * If the song was liked before, remove the like.
     * Otherwise save like.
     * @param songId Song's id
     * @param authentication Authentication object
     * @returns True or False. True, if song received like, otherwise false
     */
    public async toggleLikeForSong(songId: string, authentication: User): Promise<ToggleLikedSongDTO> {
        const existing = await this.findByUserAndSong(authentication?.id, songId);

        // Remove like if exists.
        if(existing) {
            return this.likedSongRepository.delete({ id: existing.id }).then((): ToggleLikedSongDTO => ({
                isLiked: false,
                song: existing
            })).catch(() => {
                throw new BadRequestException("Could not remove like from song.")
            });
        }

        const like = new LikedSong();
        like.user = authentication;
        like.song = { id: songId } as Song;



        return this.likedSongRepository.save(like).then(async (): Promise<ToggleLikedSongDTO> => ({
            isLiked: true,
            song: await this.findByUserAndSong(authentication.id, songId)
        })).catch((error) => {
            console.error(error);
            throw new BadRequestException("Could not like song.")
        })
    }

    /**
     * Toggle like state of a playlist.
     * If the playlist was liked before, remove the like.
     * Otherwise save like.
     * @param playlistId Playlist's id
     * @param authentication Authentication object
     * @returns True or False. True, if playlist received like, otherwise false
     */
    public async toggleLikeForPlaylist(playlistId: string, authentication: User): Promise<boolean> {
        const playlist = await this.playlistService.findById(playlistId);
        if(!playlist) throw new NotFoundException();
        if(playlist.author?.id == authentication?.id) throw new BadRequestException("Author cannot like his own playlists.");
        if(playlist.privacy == PlaylistPrivacy.PRIVATE) throw new BadRequestException("Cannot like this type of playlist.")

        const existing = await this.findByUserAndPlaylist(authentication?.id, playlistId);
        // Remove like if exists.
        if(existing) {
            return this.repository.delete({ id: existing.id }).then(() => false).catch(() => {
                throw new BadRequestException("Could not remove like from playlist.")
            })
        }

        const like = new LikedPlaylist()
        like.user = <User>{ id: authentication.id };
        like.playlist = <Playlist>{ id: playlistId };

        return this.repository.save(like).then(() => true).catch(() => {
            throw new BadRequestException("Could not like playlist.")
        })
    }

    /**
     * Toggle like state of an album.
     * If the album was liked before, remove the like.
     * Otherwise save like.
     * @param albumId Album's id
     * @param authentication Authentication object
     * @returns True or False. True, if album received like, otherwise false
     */
    public async toggleLikeForAlbum(albumId: string, authentication: User): Promise<boolean> {
        const existing = await this.findByUserAndAlbum(authentication?.id, albumId);

        // Remove like if exists.
        if(existing) {
            return this.repository.delete({ id: existing.id }).then(() => false).catch(() => {
                throw new BadRequestException("Could not remove like from album.")
            })
        }

        const like = new LikedAlbum()
        like.user = <User>{ id: authentication.id };
        like.album = <Album>{ id: albumId };

        return this.repository.save(like).then(() => true).catch(() => {
            throw new BadRequestException("Could not like album.")
        })
    }

}
