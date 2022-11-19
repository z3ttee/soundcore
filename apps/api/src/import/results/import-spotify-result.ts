import { Playlist } from "../../playlist/entities/playlist.entity";
import { ImportTaskStatus, ImportTaskType } from "../entities/import.entity";

export enum SpotifyFailedReason {
    NOT_FOUND = 0,
    ERROR = 1
}

export class FailedSpotifySongs {

    constructor(
        public readonly title: string,
        public readonly artists: string[],
        public readonly album: string,
        public readonly reason: SpotifyFailedReason
    ) {}

}

export class ImportSpotifyResult {

    constructor(
        public readonly type: ImportTaskType,
        public readonly playlist: Playlist,
        public readonly status: ImportTaskStatus,
        public readonly notImported: FailedSpotifySongs[],
        public readonly errorMessage?: string
    ) {}

}