import { PlaylistPrivacy } from "../../playlist/enums/playlist-privacy.enum";
import { User } from "../../user/entities/user.entity";
import { ImportReport } from "./import-report.entity";

export enum ImportTaskType {
    SPOTIFY_PLAYLIST = 0
}

export enum ImportTaskStatus {
    ENQUEUED = 0,
    PROCESSING = 1,
    OK = 2,
    ERRORED = 3,
    SERVER_ABORT = 4
}

export class ImportTask<P = any, R = any> {

    /**
     * DEFAULT ATTRIBUTES
     */
    public id: string;
    public url: string;
    public type: ImportTaskType;
    public status: ImportTaskStatus;
    public privacy: PlaylistPrivacy;
    public payload?: P;
    public report?: ImportReport<R>;

    /**
     * RELATIONS
     */
    public user?: User;
    
}