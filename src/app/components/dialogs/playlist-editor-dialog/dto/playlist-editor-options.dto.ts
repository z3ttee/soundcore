import { Playlist } from "src/app/features/playlist/entities/playlist.entity";

export class AscPlaylistEditorOptions {

    public mode: "create" | "edit" = "create";
    public contextData?: Playlist = undefined;

}