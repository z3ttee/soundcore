import { HttpClient, HttpErrorResponse, HttpEventType, HttpResponse } from "@angular/common/http";
import { BehaviorSubject, catchError, filter, Observable, of, Subscription, tap } from "rxjs";
import { AuthenticationService } from "src/app/services/authentication.service";
import { environment } from "src/environments/environment";
import { FileStatus } from "../enums/file-status.enum";
import { UploadedAudioFile } from "./uploaded-file.entity";

import { v4 as uuidv4 } from "uuid"

export class UploadInfo {

    public status: FileStatus = FileStatus.STATUS_AWAIT_UPLOAD;
    public error: string = undefined;
    public progress: number = 0;

}

export class Upload {
    private _$upload: Subscription;

    private _infoSubject: BehaviorSubject<UploadInfo> = new BehaviorSubject(new UploadInfo());
    public $info: Observable<UploadInfo> = this._infoSubject.asObservable();

    public file: File;

    // TODO: Auto-generate id
    public id: string;

    constructor(file: File, private httpClient: HttpClient, private authService: AuthenticationService) {
        this.file = file;
        this.id = uuidv4();
    }

    public get status(): FileStatus {
        return this._infoSubject.getValue().status;
    }

    public isUploading() {
        return this._infoSubject.getValue().status == FileStatus.STATUS_UPLOADING;
    }

    public isDone() {
        return !this.isUploading();
    }

    public hasError() {
        return this._infoSubject.getValue().status == FileStatus.STATUS_ERRORED;
    }

    public start() {
        this.updateStatus(FileStatus.STATUS_UPLOADING)

        const fileData = new FormData();
        fileData.append("file", this.file)

        this._$upload = this.httpClient.post(`${environment.api_base_uri}/v1/uploads/song/`, fileData, {
            // TODO: Remove headers and add to interceptor
            headers: {
                "Authorization": this.authService.getSession().accessToken
            },
            reportProgress: true,
            observe: "events"
        }).pipe(
            catchError((err: HttpErrorResponse, caught) => {
                this.error(err.message)
                return caught;
            }),
            tap((event) => {
                if(event.type == HttpEventType.UploadProgress) {
                    this.updateProgress(Math.round(100 * event["loaded"] / event["total"]))
                }
            }),
            filter((event) => event.type == HttpEventType.Response)
        ).subscribe((response: HttpResponse<UploadedAudioFile>) => {
            this.id = response.body.id
            console.log("assigned id: ", this.id)
            this.updateStatus(response.body.status)
        })
    }

    public abort() {
        this._$upload.unsubscribe();
        this.updateStatus(FileStatus.STATUS_ABORTED)
    }

    private updateProgress(progress: number) {
        const info: UploadInfo = this._infoSubject.getValue();
        info.progress = progress;

        this._infoSubject.next(info)
    }

    public updateStatus(status: FileStatus) {
        const info: UploadInfo = this._infoSubject.getValue();
        info.status = status;

        this._infoSubject.next(info)
    }

    private error(error: string) {
        const info: UploadInfo = this._infoSubject.getValue();
        info.status = FileStatus.STATUS_ERRORED;
        info.progress = 0;
        info.error = error

        this._infoSubject.next(info)
    }
}