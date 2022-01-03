import { HttpClient, HttpErrorResponse, HttpEventType, HttpResponse } from "@angular/common/http";
import { Injectable, OnInit } from "@angular/core";
import { BehaviorSubject, catchError, filter, Observable, retry, Subscription, tap } from "rxjs";
import { io, Socket } from "socket.io-client";
import { AuthenticationService } from "src/app/services/authentication.service";
import { environment } from "src/environments/environment";
import { Index } from "../entities/index.entity";
import { Upload } from "../entities/upload.entity";
import { IndexStatus } from "../enums/index-status.enum";
import { SocketStatus } from "../enums/socket-status.enum";

const MAX_UPLOADS = 3

@Injectable({
    providedIn: "root"
})
export class UploadService {

    private _uploads: Map<string, Subscription> = new Map();
    private _queue: Map<string, Upload> = new Map();
    private _socket: Socket;

    private _socketConnectedSubject: BehaviorSubject<SocketStatus> = new BehaviorSubject(SocketStatus.CONNECTING);
    private _queueSubject: BehaviorSubject<Upload[]> = new BehaviorSubject([]);
    private _indexSubject: BehaviorSubject<Index[]> = new BehaviorSubject([]);

    public $queue: Observable<Upload[]> = this._queueSubject.asObservable();
    public $indexQueue: Observable<Index[]> = this._indexSubject.asObservable();
    public $socketConnected: Observable<SocketStatus> = this._socketConnectedSubject.asObservable();

    constructor(private httpClient: HttpClient, private authService: AuthenticationService){
        this.connectToSocket();
    }

    /**
     * Add new upload to queue.
     * @param file File to upload
     * @returns Upload
     */
    public async enqueueFile(file: File): Promise<Upload> {
        console.log(`[QUEUE] Enqueuing file '${file.name}'`)

        const upload = new Upload(file);
        upload.index = {
            status: IndexStatus.PREPARING
        } as Index

        console.log(`[QUEUE] Created new upload instance:`, upload)

        // Push new upload to queue
        console.log(`[QUEUE] Pushing upload instance:`, upload)
        this._queue[upload.id] = upload
        this._queueSubject.next(Object.values(this._queue));

        setTimeout(() => this.next(), 100)
        return upload
    }

    /**
     * Abort an upload by its id
     * @param uploadId Upload's id
     */
    public async abortUpload(uploadId: string) {
        const upload = this._queueSubject.getValue().find((u) => u.id == uploadId);

        this.unsubscribe(uploadId)

        if(upload) {
            upload.index.status = IndexStatus.ABORTED
            this.updateUpload(upload)
        }
    }

    /**
     * Update index.
     * @param index Index
     */
    public async updateIndex(index: Index) {
        const indices = this._indexSubject.getValue();
        const existingIndexNr = indices.findIndex((i) => i.id == index.id);

        if(existingIndexNr == -1) return;
        indices[existingIndexNr] = index;

        this._indexSubject.next(indices);
    }

    /**
     * Start uploading process for an upload instance.
     * @param upload Upload instance
     */
    private async startUpload(upload: Upload) {
        this._uploads[upload.id] = upload;
        console.info(`[QUEUE] Added to upload array.`, this._uploads[upload.id]);

        // Build form data for post request
        const fileData = new FormData();
        fileData.append("file", upload.file)
        console.info(`[QUEUE] Appended file to post request:`, fileData);

        // Set status to uploading
        upload.index.status = IndexStatus.UPLOADING;
        this.updateUpload(upload)

        console.info(`[QUEUE] Status update sent: ${upload.index.status}`);
        console.info(`[QUEUE] Starting upload. (${this._uploads.size+1}/${MAX_UPLOADS})`)

        let uploadSubscription: Subscription = null;
        this._uploads[upload.id] = uploadSubscription;

        // Start post request and save the subscription
        uploadSubscription = this.httpClient.post(`${environment.api_base_uri}/v1/upload/audio/`, fileData, {            
            reportProgress: true,
            observe: "events"
        }).pipe(
            retry(0),
            catchError((err: HttpErrorResponse, caught) => {
                console.error(err)
                upload.setError(err.error);
                this.unsubscribe(upload.id);
                this.updateUpload(upload);

                console.log(uploadSubscription)
                uploadSubscription.unsubscribe();
                return caught;
            }),
            tap((event) => {
                // Track upload progress
                if(event.type == HttpEventType.UploadProgress) {
                    upload.setProgress(Math.round(100 * event["loaded"] / event["total"]))
                }
            }),
            filter((event) => event.type == HttpEventType.Response)
        ).subscribe((response: HttpResponse<Index>) => {
            upload.index = response.body;
            this.updateUpload(upload)
            this.onUploadEnd(upload)
        })

        this._uploads[upload.id] = uploadSubscription;
    }

    private async unsubscribe(uploadId: string) {
        const subscription = this._uploads.get(uploadId);
        if(!subscription) {
            console.log("no subscription found")
            return;
        }
        subscription.unsubscribe();
    }

    /**
     * Update upload by pushing it to all observables.
     * @param upload Upload
     */
    private async updateUpload(upload: Upload) {
        console.log(`[QUEUE] Updating status of upload ${upload.id}`)
        this._queue[upload.id] = upload;
        this._queueSubject.next(Object.values(this._queue))
    }

    /**
     * Start next upload in queue.
     */
    private async next() {
        if(this._uploads.size >= MAX_UPLOADS) {
            console.warn(`[QUEUE] Cannot start next upload: Already reached limit of simultaneous uploads. (${this._uploads.size}/${MAX_UPLOADS})`)
            return;
        }

        const upload = this._queueSubject.getValue().splice(0, 1)[0];
        if(!upload) {
            console.warn(`[QUEUE] Cannot start next upload: Queue empty`)
            return;
        }

        this.startUpload(upload);
    }

    /**
     * Handle upload ended event.
     * @param upload Upload
     */
    private async onUploadEnd(upload: Upload) {
        const uploads = this._queueSubject.getValue();
        const index = uploads.findIndex((u) => u.id == upload.id )

        console.log(uploads)

        // Queue gets not cleared up ?!

        // Remove from queue
        uploads.splice(index, 1);
        console.log(uploads)
        this._queueSubject.next(uploads)

        // Remove from ongoing uploads
        delete this._uploads[upload.id];
        console.log("Upload " + upload.id + " ended");

        // Add to index queue for status observation
        this._indexSubject.next([
            ...this._indexSubject.getValue(),
            upload.index
        ])
        
        // Start next if queue not empty
        setTimeout(() => this.next(), 1000)
    }

    /**
     * Establish connection with index-status socket to receive realtime indexing updates.
     * If the connection is not possible, then a little warning should appear by checking the
     * $socketAvailable Observable.
     */
    private async connectToSocket() {
        this._socket = io(`${environment.api_base_uri}/index-status/`, {
            extraHeaders: {
              "Authorization": "Bearer " + this.authService.getAccessToken()
            }
        })

        this._socket.on("disconnect", () => this.handleDisconnectEvent());
        this._socket.on("connect", () => this.handleConnectEvent());
        this._socket.on("error", () => this.handleErrorEvent());
        this._socket.on("connect_error", () => this.handleConnectionError());
    }

    private async handleDisconnectEvent() {
        console.warn("[INDEX_STATUS] Disconnected from socket. Service is in limited use mode.")
        this._socketConnectedSubject.next(SocketStatus.UNAVAILABLE)
    }

    private async handleConnectEvent() {
        console.warn("[INDEX_STATUS] Connected to socket. Listening for index status updates.")
        this._socketConnectedSubject.next(SocketStatus.OK)
    }

    private async handleConnectionError() {
        console.error("[INDEX_STATUS] Could not create connection to socket. This either means there is no internet connection, the service may be down or your session is expired.")
        this._socketConnectedSubject.next(SocketStatus.UNAVAILABLE)
    }

    private async handleErrorEvent() {
        console.error("[INDEX_STATUS] Error occured on socket connection.")
        this._socketConnectedSubject.next(SocketStatus.UNAVAILABLE)
    }

}