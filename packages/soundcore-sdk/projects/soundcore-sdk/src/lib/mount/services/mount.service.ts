import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
<<<<<<< HEAD
import { SCSDKOptions, SCSDK_OPTIONS } from "../../scdk.module";
=======
import { SCSDKOptions } from "../../scdk.module";
>>>>>>> main
import { CreateResult } from "../../utils/results/creation.result";
import { CreateMountDTO } from "../dtos/create-mount.dto";
import { UpdateMountDTO } from "../dtos/update-mount.dto";
import { Mount } from "../entities/mount.entity";
import { Page, Pageable } from "../../pagination";
import { Future, toFuture } from "../../utils/future";
import { Task } from "../../tasks/entities/task.entity";
import { SCSDK_OPTIONS } from "../../constants";

@Injectable()
export class SCSDKMountService {

    constructor(
        private readonly httpClient: HttpClient,
        @Inject(SCSDK_OPTIONS) private readonly options: SCSDKOptions
    ) {}

    /**
     * Find a mount by its id.
     * @param mountId Mount's id
     * @returns Mount
     */
    public findById(mountId: string): Observable<Future<Mount>> {
        if(!mountId) return of(null);
        return this.httpClient.get<Mount>(`${this.options.api_base_uri}/v1/mounts/${mountId}`).pipe(toFuture());
    }

    /**
     * Find a page of mounts of a bucket.
     * @param bucketId Bucket's id
     * @param pageable Page settings
     * @returns Page<Mount>
     */
    public findAllByBucketId(bucketId: string, pageable: Pageable): Observable<Future<Page<Mount>>> {
        if(!bucketId) return of(Future.notfound("Invalid bucketId."));
        return this.httpClient.get<Page<Mount>>(`${this.options.api_base_uri}/v1/mounts/bucket/${bucketId}${pageable.toQuery()}`).pipe(toFuture());
    }

    /**
     * Set the mount to the default mount inside its
     * bucket.
     * @param mountId Mount's id to set as default in own bucket.
     * @returns Mount
     */
    public setDefault(mountId: string): Observable<Future<Mount>> {
        if(!mountId) return of(Future.notfound("Invalid mountId."));
        return this.httpClient.put<Mount>(`${this.options.api_base_uri}/v1/mounts/${mountId}/default`, null).pipe(toFuture());
    }

    /**
     * Create a new mount.
     * @param createMountDto Data to create
     * @returns Mount
     */
    public create(createMountDto: CreateMountDTO): Observable<Future<CreateResult<Mount>>> {
        if(!createMountDto) return of(Future.error("Missing required data.", 400));
        return this.httpClient.post<CreateResult<Mount>>(`${this.options.api_base_uri}/v1/mounts`, createMountDto).pipe(toFuture());
    }

    /**
     * Update a mount.
     * @param mountId Mount to update
     * @param updateMountDto Updated data
     * @returns Mount
     */
    public update(mountId: string, updateMountDto: UpdateMountDTO): Observable<Future<Mount>> {
        if(!updateMountDto) return of(Future.error("Missing required data.", 400));
        return this.httpClient.put<Mount>(`${this.options.api_base_uri}/v1/mounts/${mountId}`, updateMountDto).pipe(toFuture());
    }

    /**
     * Delete a mount by its id
     * @param mountId Mount id to delete
     * @returns True if deleted. Otherwise false.
     */
    public deleteById(mountId: string): Observable<Future<boolean>> {
        if(!mountId) return of(Future.notfound());
        return this.httpClient.delete<boolean>(`${this.options.api_base_uri}/v1/mounts/${mountId}`).pipe(toFuture());
    }

    /**
     * Trigger scanning process for a mount. Returns
     * the position in the mount-scan queue.
     * @param mountId Mount's id
     * @returns Position in queue
     */
    public rescanMount(mountId: string): Observable<Future<Task>> {
        if(!mountId) return of(Future.notfound());
        return this.httpClient.get<Task>(`${this.options.api_base_uri}/v1/mounts/${mountId}/rescan`).pipe(toFuture());
    }

}