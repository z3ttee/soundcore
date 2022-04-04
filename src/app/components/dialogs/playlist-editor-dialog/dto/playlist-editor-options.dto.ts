import { Playlist } from "soundcore-sdk";

export class AscPlaylistEditorOptions {

    public mode: "create" | "edit" = "create";
    public contextData?: Playlist = undefined;

}