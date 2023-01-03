import { Album } from "../../album/entities/album.entity";
import { Playlist } from "../../playlist/entities/playlist.entity";
import { Song } from "../../song/entities/song.entity";
import { User } from "../../user/entities/user.entity";

export class LikedResource {
    public id: string;
    public likedAt: Date;
    public user: User;
}

export class LikedSong extends LikedResource {
    public song: Song;
}

export class LikedPlaylist extends LikedResource {
    public playlist: Playlist;
}

export class LikedAlbum extends LikedResource {
    public album: Album;
}