import { Playlist } from "../../playlist/entities/playlist.entity";
import { ImportTask } from "./import.entity";

export enum SpotifyFailedReason {
    NOT_FOUND = 0,
    ERROR = 1
}

export class FailedSpotifyImport {

    constructor(
        public readonly title: string,
        public readonly artists: string[],
        public readonly album: string,
        public readonly reason: SpotifyFailedReason
    ) {}

}

export interface ImportSpotifyStats {
    importedAmount: number;
    total: number;
    timeTookMs: number;
}

export interface ImportSpotifyReport {
    notImportedSongs: FailedSpotifyImport[];
}

export class SpotifyImport extends ImportTask<Playlist, ImportSpotifyStats, ImportSpotifyReport> {
    
}

