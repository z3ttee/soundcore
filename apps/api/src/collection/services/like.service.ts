import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Album } from '../../album/entities/album.entity';
import { Playlist } from '../../playlist/entities/playlist.entity';
import { PlaylistPrivacy } from '../../playlist/enums/playlist-privacy.enum';
import { PlaylistService } from '../../playlist/playlist.service';
import { Song } from '../../song/entities/song.entity';
import { User } from '../../user/entities/user.entity';
import { Like, LikeType } from '../entities/like.entity';

@Injectable()
export class LikeService {

    constructor(
        private playlistService: PlaylistService,
        @InjectRepository(Like) private repository: Repository<Like>
    ) {}

    public async findByUserAndSong(userId: string, songId: string): Promise<Like> {
        return this.repository.findOne({ where: { user: { id: userId }, song: { id: songId }}}) as Promise<Like>
    }

    public async findByUserAndPlaylist(userId: string, playlistId: string): Promise<Like> {
        return this.repository.findOne({ where: { user: { id: userId }, playlist: { id: playlistId }}}) as Promise<Like>
    }

    public async findByUserAndAlbum(userId: string, albumId: string): Promise<Like> {
        return this.repository.findOne({ where: { user: { id: userId }, album: { id: albumId }}}) as Promise<Like>
    }

    public async isPlaylistAuthor(userId: string, playlistId: string): Promise<boolean> {
        return !! await this.repository.findOne({ where: { playlist: { id: playlistId, author: { id: userId }}}})
    }

    public async likeSong(songId: string, authentication: User): Promise<boolean> {
        const existing = await this.findByUserAndSong(authentication?.id, songId);

        // Remove like if exists.
        if(existing) {
            return this.repository.delete({ id: existing.id }).then(() => false).catch(() => {
                throw new BadRequestException("Could not remove like from song.")
            })
        }

        const like = new Like();
        like.type = LikeType.SONG;
        like.user = authentication;
        like.song = { id: songId } as Song;

        return this.repository.save(like).then(() => true).catch(() => {
            throw new BadRequestException("Could not like song.")
        })
    }

    public async likePlaylist(playlistId: string, authentication: User): Promise<boolean> {
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

        const like = new Like()
        like.type = LikeType.PLAYLIST;
        like.user = authentication;
        like.playlist = { id: playlistId } as Playlist;

        return this.repository.save(like).then(() => true).catch(() => {
            throw new BadRequestException("Could not like playlist.")
        })
    }

    public async likeAlbum(albumId: string, authentication: User): Promise<boolean> {
        const existing = await this.findByUserAndAlbum(authentication?.id, albumId);

        // Remove like if exists.
        if(existing) {
            return this.repository.delete({ id: existing.id }).then(() => false).catch(() => {
                throw new BadRequestException("Could not remove like from album.")
            })
        }

        const like = new Like()
        like.type = LikeType.ALBUM;
        like.user = authentication;
        like.album = { id: albumId } as Album;

        return this.repository.save(like).then(() => true).catch(() => {
            throw new BadRequestException("Could not like album.")
        })
    }

}
