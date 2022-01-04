import { HttpClient, HttpErrorResponse, HttpEventType, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, catchError, filter, Observable, retry, Subscription, tap } from "rxjs";
import { environment } from "src/environments/environment";
import { Index } from "../entities/index.entity";
import { Upload } from "../entities/upload.entity";
import { IndexStatus } from "../enums/index-status.enum";

const MAX_UPLOADS = 1

@Injectable({
    providedIn: "root"
})
export class UploadService {

    private _uploadSubs: Map<string, Subscription> = new Map();
    private _enqueuedUploads: Upload[] = [];

    private _queueUpdateSubject: BehaviorSubject<Upload[]> = new BehaviorSubject([]);
    private _indexUpdateSubject: BehaviorSubject<Index[]> = new BehaviorSubject([]);

    public $queue: Observable<Upload[]> = this._queueUpdateSubject.asObservable();
    public $indexQueue: Observable<Index[]> = this._indexUpdateSubject.asObservable();

    constructor(
        private httpClient: HttpClient
    ){}

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


        // Push new upload to queue
        this._enqueuedUploads.push(upload)
        console.log(`[QUEUE] Pushing upload instance. Queue-size: ${this._enqueuedUploads.length}`)

        const queue = this._queueUpdateSubject.getValue();
        queue.push(upload);
        this._queueUpdateSubject.next(queue);

        await this.next();
        return upload
    }

    /**
     * Abort an upload by its id
     * @param uploadId Upload's id
     */
    public async abortUpload(uploadId: string) {
        await this.unsubscribe(uploadId)
        await this.clearUpload(uploadId);

        // Because there was an upload aborted by the user, we may want to
        // continue with the next one.
        await this.next();
    }

    /**
     * Update index.
     * @param index Index
     */
    public async updateIndex(index: Index) {
        const indices = this._indexUpdateSubject.getValue();
        const existingIndexNr = indices.findIndex((i) => i.id == index.id);

        if(existingIndexNr == -1) return;
        indices[existingIndexNr] = index;

        this._indexUpdateSubject.next(indices);
    }

    /**
     * Remove an index by its id from the list.
     * @param indexId Index id
     */
    public async clearIndex(indexId: string) {
        const indices = this._indexUpdateSubject.getValue();
        const existingIndexNr = indices.findIndex((i) => i.id == indexId);

        if(existingIndexNr == -1) return;
        indices.splice(existingIndexNr, 1);

        this._indexUpdateSubject.next(indices);
    }

    /**
     * Remove an upload by its id from the list.
     * @param uploadId Upload id
     */
    private async clearUpload(uploadId: string) {
        const uploads = this._queueUpdateSubject.getValue();
        const indexNr = uploads.findIndex((u) => u.id == uploadId);

        if(indexNr == -1) return;
        uploads.splice(indexNr, 1);

        this._queueUpdateSubject.next(uploads);
    }

    /**
     * Start uploading process for an upload instance.
     * @param upload Upload instance
     */
    private async startUpload(upload: Upload) {
        // Build form data for post request
        const fileData = new FormData();
        fileData.append("file", upload.file)

        // Set status to uploading
        upload.setStatus(IndexStatus.UPLOADING)
        this.updateUpload(upload)

        console.info(`[QUEUE] Starting upload. (${this._uploadSubs.size}/${MAX_UPLOADS})`)

        const uploadSubscription: Subscription = this.httpClient.post(`${environment.api_base_uri}/v1/upload/audio/`, fileData, {            
            reportProgress: true,
            observe: "events"
        }).pipe(
            retry(0),
            catchError((err: HttpErrorResponse, caught) => {
                console.error(err.error)
                upload.setError(err.error);
                this.updateUpload(upload);
                this.onUploadEnd(upload, false);

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
            this.onUploadEnd(upload, true)
        })

        // Register subscription in an array to limit
        // simultaneous uploads and to be able to cancel.
        this._uploadSubs.set(upload.id, uploadSubscription)
        console.info(`[QUEUE] Added to upload array. Currently uploading ${this._uploadSubs.size} items...`, );
    }

    /**
     * Cancel upload request by unsubscribing the subscription.
     * This also removes the item from the uploadSubs map
     * @param uploadId Upload id to cancel
     */
    private async unsubscribe(uploadId: string) {
        const subscription = this._uploadSubs.get(uploadId);
        if(!subscription) return;

        subscription.unsubscribe();
        this._uploadSubs.delete(uploadId);
    }

    /**
     * Update upload by pushing it to all observables.
     * @param upload Upload
     */
    private async updateUpload(upload: Upload) {
        const uploads = this._queueUpdateSubject.getValue();
        
        const updateIndex = uploads.findIndex((u) => u.id == upload.id);
        if(updateIndex == -1) return;
        
        uploads[updateIndex] = upload;
        this._queueUpdateSubject.next(uploads)
    }

    /**
     * Start next upload in queue.
     */
    private async next() {
        if(this._uploadSubs.size >= MAX_UPLOADS) {
            console.warn(`[QUEUE] Cannot start next upload: Already reached limit of simultaneous uploads. (${this._uploadSubs.size}/${MAX_UPLOADS})`)
            return;
        }

        const nextUploads = this._enqueuedUploads.splice(0, 1);
        if(!nextUploads || !nextUploads[0]) {
            console.warn(`[QUEUE] Cannot start next upload: Queue empty`)
            return;
        }

        await this.startUpload(nextUploads[0]);
    }

    /**
     * Handle upload ended event.
     * @param upload Upload
     */
    private async onUploadEnd(upload: Upload, shouldPromote: boolean = true) {
        console.info(`[QUEUE] Upload ${upload.id} ended. Promoting to index.`)

        // Remove from ongoing uploads
        this.unsubscribe(upload.id)

        if(shouldPromote) {
            const uploads = this._queueUpdateSubject.getValue();
            const index = uploads.findIndex((u) => u.id == upload.id )

            // Remove from queue
            uploads.splice(index, 1);
            this._queueUpdateSubject.next(uploads)

            // Promote upload to index
            this.addToIndices(upload.index);
        }
        
        // Start next if queue not empty
        setTimeout(() => this.next(), 1000)
    }

    private async addToIndices(index: Index) {
        const indices = this._indexUpdateSubject.getValue();
        indices.push(index);

        this._indexUpdateSubject.next(indices)
    }

}