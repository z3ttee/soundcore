import { Playlist } from "../../playlist/entities/playlist.entity";
import { ImportTaskStatus } from "../entities/import.entity";

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

export interface ImportSpotifyResultStats {
    importedAmount: number;
    total: number;
}

export class ImportSpotifyResult {

    constructor(
        public readonly playlist: Playlist,
        public readonly status: ImportTaskStatus,
        public readonly stats: ImportSpotifyResultStats,
        public readonly timeTookMs: number
    ) {}

}