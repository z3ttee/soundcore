import { LikedSong } from "../entities/like.entity";

export interface ToggleLikedSongDTO {

    song: LikedSong;
    isLiked: boolean;

}