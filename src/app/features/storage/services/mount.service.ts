import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { Page, Pageable } from "src/app/pagination/pagination";
import { DialogService } from "src/app/services/dialog.service";
import { SnackbarService } from "src/app/services/snackbar.service";
import { environment } from "src/environments/environment";
import { MountEditorDialog } from "../dialogs/mount-editor/mount-editor.dialog";
import { CreateMountDTO } from "../dto/create-mount.dto";
import { UpdateMountDTO } from "../dto/update-mount.dto";
import { Bucket } from "../entities/bucket.entity";
import { Mount } from "../entities/mount.entity";

@Injectable()
export class MountService {

    constructor(
        private snackbarService: SnackbarService,
        private dialogService: DialogService,
        private httpClient: HttpClient
    ) {}

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

    public async delete(mountId: string): Promise<boolean> {
        return this.dialogService.confirm({
            title: "Diesen Mount wirklich löschen?",
            message: "Bitte bestätige, dass du diesen Mount löschen möchtest. Das hat zur Folge, dass alle darin gespeicherten Lieder nicht mehr in der Datenbank verfügbar sind. BEACHTE: Alle gespeicherten Dateien werden nicht gelöscht, sondern zukünftig ignoriert."
        }).then((dialogRef) => {
            return firstValueFrom(dialogRef.afterClosed()).then((confirmed) => {
                if(!confirmed) return false;
                
                return firstValueFrom(this.httpClient.delete(`${environment.api_base_uri}/v1/mounts/${mountId}`)).then(() => {
                    this.snackbarService.info("Mount gelöscht.")
                    return true;
                }).catch((error) => {
                    this.snackbarService.error("Fehler: " + error.message)
                    return false;
                })
            }).catch((error) => {
                console.error(error);
                return false;
            })
        })
    }

    public async openMountEditor(bucket: Bucket, mount?: Mount) {
        return this.dialogService.open(MountEditorDialog, {
            data: {
              bucket,
              isEditMode: !!mount,
              ...{ ...mount }
            }
        })
    }

}