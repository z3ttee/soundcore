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
        return firstValueFrom(this.httpClient.post<Mount>(`${environment.api_base_uri}/v1/mounts`, createMountDto)).then((mount) => {
            this.snackbarService.info(`Mount erstellt.`)
            return mount;
        })
    }

    public async update(mountId: string, updateMountDto: UpdateMountDTO): Promise<Mount> {
        return firstValueFrom(this.httpClient.put<Mount>(`${environment.api_base_uri}/v1/mounts/${mountId}`, updateMountDto)).then((mount) => {
            this.snackbarService.info(`Mount aktualisiert.`)
            return mount;
        })
    }

    public async delete(mountId: string): Promise<boolean> {
        return this.dialogService.confirm({
            title: "Diesen Mount wirklich l??schen?",
            message: "Bitte best??tige, dass du diesen Mount l??schen m??chtest. Das hat zur Folge, dass alle darin gespeicherten Lieder nicht mehr in der Datenbank verf??gbar sind. BEACHTE: Alle gespeicherten Dateien werden nicht gel??scht, sondern zuk??nftig ignoriert."
        }).then((dialogRef) => {
            return firstValueFrom(dialogRef.afterClosed()).then((confirmed) => {
                if(!confirmed) return false;
                
                return firstValueFrom(this.httpClient.delete(`${environment.api_base_uri}/v1/mounts/${mountId}`)).then(() => {
                    this.snackbarService.info("Mount gel??scht.")
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