import { Index } from "../../upload/entities/index.entity";

export type ImportStatus = "preparing" | "downloading" | "upgradeIndex" | "errored"
export class ImportEntity {

    public id: string;
    public url: string;
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

    public upgradeIndex: Index;
    public status: ImportStatus = "preparing";

}