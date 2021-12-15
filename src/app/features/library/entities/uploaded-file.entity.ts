import { Observable } from "rxjs";
import { SSOUser } from "src/app/model/sso-user.model";
import { FileStatus } from "../enums/file-status.enum";

export class UploadedAudioFile {

    public id: string;
    public sizeInBytes: number;
    public status: FileStatus;
    public checksum: string;
    public uploadedAt: Date;
    // TODO: Add song entity
    public metadata: any;
    public uploader: SSOUser;
    public originalName: string;

}