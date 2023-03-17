import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
<<<<<<< HEAD
import { SCSDKOptions, SCSDK_OPTIONS } from "../../scdk.module";
=======
import { SCSDKOptions } from "../../scdk.module";
>>>>>>> main
import { File } from "../entities/file.entity";
import { Page, Pageable } from "../../pagination";
import { SCSDK_OPTIONS } from "../../constants";

@Injectable()
export class SCDKFileService {

    constructor(
        private readonly httpClient: HttpClient,
        @Inject(SCSDK_OPTIONS) private readonly options: SCSDKOptions
    ) {}

    /**
     * Find a file by its id.
     * @param fileId File's id
     * @returns File
     */
    public findById(fileId: string): Observable<File> {
        if(!fileId) return of(null);
        return this.httpClient.get<File>(`${this.options.api_base_uri}/v1/files/${fileId}`);
    }

    /**
     * Find a page of files for a mount.
     * @param mountId Mount's id.
     * @param pageable Page settings
     * @returns Page<File>
     */
    public findByMountId(mountId: string, pageable: Pageable): Observable<Page<File>> {
        if(!mountId) return of(Page.of([], 0, pageable.page));
        return this.httpClient.get<Page<File>>(`${this.findByMountIdBaseURL(mountId)}${pageable.toQuery()}`);
    }

    public findByMountIdBaseURL(mountId: string): string {
        return `${this.options.api_base_uri}/v1/files/mount/${mountId}`;
    }

}