import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { SCDKOptions, SCDK_OPTIONS } from "../../scdk.module";
import { ApiResponse } from "../../utils/responses/api-response";
import { CreateResult } from "../../utils/results/creation.result";
import { apiResponse } from "../../utils/rxjs/operators/api-response";
import { CreateMountDTO } from "../dtos/create-mount.dto";
import { UpdateMountDTO } from "../dtos/update-mount.dto";
import { Mount } from "../entities/mount.entity";
import { Page, Pageable } from "../../pagination";

@Injectable({
    providedIn: "root"
})
export class SCDKMountService {

    constructor(
        private readonly httpClient: HttpClient,
        @Inject(SCDK_OPTIONS) private readonly options: SCDKOptions
    ) {}

    /**
     * Find a mount by its id.
     * @param mountId Mount's id
     * @returns Mount
     */
    public findById(mountId: string): Observable<Mount> {
        if(!mountId) return of(null);
        return this.httpClient.get<Mount>(`${this.options.api_base_uri}/v1/mounts/${mountId}`);
    }

    /**
     * Find a page of mounts of a bucket.
     * @param bucketId Bucket's id
     * @param pageable Page settings
     * @returns Page<Mount>
     */
    public findByBucketId(bucketId: string, pageable: Pageable): Observable<Page<Mount>> {
        if(!bucketId) return of(Page.of([], 0, pageable.page));
        return this.httpClient.get<Page<Mount>>(`${this.options.api_base_uri}/v1/mounts/bucket/${bucketId}`);
    }

    /**
     * Set the mount to the default mount inside its
     * bucket.
     * @param mountId Mount's id to set as default in own bucket.
     * @returns Mount
     */
    public setDefault(mountId: string): Observable<Mount> {
        if(!mountId) return of(null);
        return this.httpClient.put<Mount>(`${this.options.api_base_uri}/v1/mounts/${mountId}/default`, null);
    }

    /**
     * Create a new mount.
     * @param createMountDto Data to create
     * @returns Mount
     */
    public create(createMountDto: CreateMountDTO): Observable<ApiResponse<CreateResult<Mount>>> {
        if(!createMountDto) return of(ApiResponse.withPayload(null));
        return this.httpClient.post<CreateResult<Mount>>(`${this.options.api_base_uri}/v1/mounts`, createMountDto).pipe(apiResponse());
    }

    /**
     * Update a mount.
     * @param mountId Mount to update
     * @param updateMountDto Updated data
     * @returns Mount
     */
    public update(mountId: string, updateMountDto: UpdateMountDTO): Observable<ApiResponse<Mount>> {
        if(!updateMountDto) return of(null);
        return this.httpClient.put<Mount>(`${this.options.api_base_uri}/v1/mounts/${mountId}`, updateMountDto).pipe(apiResponse());
    }

    /**
     * Delete a mount by its id
     * @param mountId Mount id to delete
     * @returns True if deleted. Otherwise false.
     */
    public deleteById(mountId: string): Observable<ApiResponse<boolean>> {
        if(!mountId) return of(ApiResponse.withPayload(false));
        return this.httpClient.delete<boolean>(`${this.options.api_base_uri}/v1/mounts/${mountId}`).pipe(apiResponse());
    }

}