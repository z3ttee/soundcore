import { Playlist } from "../../playlist/entities/playlist.entity";
import { ImportTask, ImportTaskStatus } from "./import.entity";

export enum FailedReason {
    NOT_FOUND = 0,
    ERROR = 1
}

export interface FailedSpotifyImport {
    title: string;
    artists: string[];
    album: string;
    reason: FailedReason;
}

export interface ImportSpotifyStats {
    importedAmount: number;
    total: number;
    timeTookMs: number;
}

export interface ImportSpotifyReport {
    notImportedSongs: FailedSpotifyImport[];
}

export class ImportSpotifyResult {

    constructor(
        public readonly playlist: Playlist,
        public readonly status: ImportTaskStatus,
        public readonly stats: ImportSpotifyStats
    ) {}

}

export class SpotifyImport extends ImportTask<Playlist, ImportSpotifyStats, ImportSpotifyReport> {}