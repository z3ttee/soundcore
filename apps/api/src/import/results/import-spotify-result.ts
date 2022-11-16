import { ImportTaskStatus, ImportTaskType } from "../entities/import.entity";

export class FailedSpotifySongs {

    constructor(
        public readonly title: string,
        public readonly primaryArtist: string,
        public readonly album: string,
        public readonly reason: string
    ) {}

}

export class ImportSpotifyResult {

    constructor(
        public readonly type: ImportTaskType,
        public readonly status: ImportTaskStatus,
        public readonly notImported: FailedSpotifySongs[],
        public readonly errorMessage?: string
    ) {}

}