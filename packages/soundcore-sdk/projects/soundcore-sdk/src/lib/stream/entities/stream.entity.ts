import { Song } from "../../song/entities/song.entity";
import { User } from "../../user/entities/user.entity";

export class SCSDKStream {

    public songId: string;
    public listenerId: string;
    public streamCount: number;
    public song: Song;
    public listener: User;

}