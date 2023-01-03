import { PlaylistPrivacy } from "../../playlist/enums/playlist-privacy.enum";

export class CreateImportDTO {

    public url: string;
    public privacy: PlaylistPrivacy;

}