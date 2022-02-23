import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { Page, Pageable } from "src/app/pagination/pagination";
import { environment } from "src/environments/environment";
import { CreateMountDTO } from "../dto/create-mount.dto";
import { UpdateMountDTO } from "../dto/update-mount.dto";
import { Mount } from "../entities/mount.entity";

@Injectable()
export class MountService {

    constructor(private httpClient: HttpClient) {}

    public async findMountsByBucketId(bucketId: string, pageable?: Pageable): Promise<Page<Mount>> {
        if(!bucketId) return Page.of([]);
        return firstValueFrom(this.httpClient.get<Page<Mount>>(`${environment.api_base_uri}/v1/mounts/byBucket/${bucketId}${Pageable.toQuery(pageable)}`))
    }

    public async findById(mountId: string): Promise<Mount> {
        if(!mountId) return null;
        return firstValueFrom(this.httpClient.get<Mount>(`${environment.api_base_uri}/v1/mounts/${mountId}`))
    }

    public async create(createMountDto: CreateMountDTO): Promise<Mount> {
        return firstValueFrom(this.httpClient.post(`${environment.api_base_uri}/v1/mounts`, createMountDto)) as Promise<Mount>
    }

    public async update(mountId: string, updateMountDto: UpdateMountDTO): Promise<Mount> {
        return firstValueFrom(this.httpClient.put(`${environment.api_base_uri}/v1/mounts/${mountId}`, updateMountDto)) as Promise<Mount>
    }

    public async delete(mountId: string): Promise<any> {
        return firstValueFrom(this.httpClient.delete(`${environment.api_base_uri}/v1/mounts/${mountId}`)) as Promise<any>
    }

}