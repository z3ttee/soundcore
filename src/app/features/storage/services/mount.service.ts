import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { Page, Pageable } from "src/app/pagination/pagination";
import { environment } from "src/environments/environment";
import { CreateMountDTO } from "../dto/create-mount.dto";
import { UpdateMountDTO } from "../dto/update-mount.dto";
import { StorageMount } from "../model/storage-mount.model";

@Injectable()
export class MountService {

    constructor(private httpClient: HttpClient) {}

    public async findMountsByBucketId(bucketId: string, pageable?: Pageable): Promise<Page<StorageMount>> {
        if(!bucketId) return Page.of([]);
        return firstValueFrom(this.httpClient.get(`${environment.api_base_uri}/v1/mounts/byBucket/${bucketId}${Pageable.toQuery(pageable)}`)) as Promise<Page<StorageMount>>
    }

    public async findById(mountId: string): Promise<StorageMount> {
        if(!mountId) return null;
        return firstValueFrom(this.httpClient.get<StorageMount>(`${environment.api_base_uri}/v1/mounts/${mountId}`))
    }

    public async create(createMountDto: CreateMountDTO): Promise<StorageMount> {
        return firstValueFrom(this.httpClient.post(`${environment.api_base_uri}/v1/mounts`, createMountDto)) as Promise<StorageMount>
    }

    public async update(mountId: string, updateMountDto: UpdateMountDTO): Promise<StorageMount> {
        return firstValueFrom(this.httpClient.put(`${environment.api_base_uri}/v1/mounts/${mountId}`, updateMountDto)) as Promise<StorageMount>
    }

    public async delete(mountId: string): Promise<any> {
        return firstValueFrom(this.httpClient.delete(`${environment.api_base_uri}/v1/mounts/${mountId}`)) as Promise<any>
    }

}