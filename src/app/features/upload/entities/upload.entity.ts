import { BehaviorSubject, Observable } from "rxjs";
import { FileStatus } from "../enums/file-status.enum";

import { v4 as uuidv4 } from "uuid"
import { Index } from "./index.entity";
import { IndexStatus } from "../enums/index-status.enum";


export class UploadStatus {

    public isDone: boolean = false;
    public hasError: boolean = false;
    public isUploading: boolean = false;

}

export class Upload {

    private _progressSubject: BehaviorSubject<number> = new BehaviorSubject(0);
    private _errorSubject: BehaviorSubject<Error> = new BehaviorSubject(null);
    private _indexSubject: BehaviorSubject<Index> = new BehaviorSubject(null);

    public readonly id: string = uuidv4();
    public readonly $index: Observable<Index> = this._indexSubject.asObservable();

    public readonly file: File;
    public readonly $progress: Observable<number> = this._progressSubject.asObservable();
    public readonly $error: Observable<Error> = this._errorSubject.asObservable();

    constructor(file: File) {
        this.file = file;
    }

    public async setProgress(progress: number) {
        this._progressSubject.next(progress);
    }

    public async setStatus(status: IndexStatus) {
        const index = this.index;
        index.status = status;
        this._indexSubject.next(index);
    }

    public set index(val: Index) {
        const index = this._indexSubject.getValue();
        if(!index) {
            this._indexSubject.next(val);
        } else {
            val.status = index.status;
            this._indexSubject.next(val);
        }
    }

    public get index(): Index {
        return this._indexSubject.getValue();
    }

    public isUploading() {
        return this._indexSubject.getValue()?.status == IndexStatus.UPLOADING;
    }

    public isDone() {
        return !this.isUploading();
    }

    public hasError() {
        return this.index?.status == IndexStatus.ERRORED;
    }

    public setError(error: Error) {
        this.setStatus(IndexStatus.ERRORED)
        // this.index?.status == IndexStatus.ERRORED;
        this._errorSubject.next(error)
    }

    /*private _$upload: Subscription;

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

        this._$upload = this.httpClient.post(`${environment.api_base_uri}/v1/upload/audio/`, fileData, {
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
        this._$upload.unsubscribe();
    }*/
}