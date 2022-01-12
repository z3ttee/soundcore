
export class UpdatePlaylistSongsDTO {

    public action: "add" | "remove";
    public songs: { id: string }[];

}