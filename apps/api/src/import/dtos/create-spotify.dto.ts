import { Contains, IsNotEmpty, IsUrl } from "class-validator";

export class CreateSpotifyImportDTO {

    @IsNotEmpty()
    @IsUrl()
    @Contains("playlist", { message: "Ungültige Spotify-Playlist URL" })
    public url: string;

}