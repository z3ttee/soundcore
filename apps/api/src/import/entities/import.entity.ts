import { v4 as uuidv4 } from "uuid"
import { User } from "../../user/entities/user.entity";

export type ImportStatus = "preparing" | "downloading" | "upgradeIndex" | "errored" | "duplicate"
export class ImportProgressUpdate {
    public progress: number;
    public importId: string;
}
export class ImportEntity {

    public id: string = uuidv4();
    public url: string;
    public startTime: number;
    public dstFilepath: string;
    public dstFilename: string;
    public downloadProgress: number;
    public downloadableUrl: string;

    public metadata: {
        title?: string,
        duration?: number,
        thumbnail_url?: string,
        description?: string,
        youtubeUrl?: string,
        youtubeStart?: number,
        albums?: string[],
        artists?: string[]
    }

    public importer?: User;
    public status: ImportStatus = "preparing";

}