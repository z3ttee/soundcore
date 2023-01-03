import { HttpClient } from "@angular/common/http";
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";
import { SCNGXDatasource, SCNGXDialogService } from "@soundcore/ngx";
import { ImportTask, ImportTaskStatus, ImportTaskType, SCSDKGeneralGateway, SCSDKImportService, SpotifyImport } from "@soundcore/sdk";
import { filter, Subject, takeUntil } from "rxjs";
import { AppImportSpotifyCreateDialog } from "src/app/dialogs/import-spotify-create-dialog/import-spotify-create-dialog.component";
import { environment } from "src/environments/environment";

interface SpotifyPendingTabProps {
    datasource?: SCNGXDatasource<ImportTask>;
    lastTaskUpdate?: ImportTask;
}

@Component({
    templateUrl: "./spotify-pending-tab.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpotifyPendingTabComponent implements OnInit, OnDestroy {

    /**
     * Subject used to destroy internal subscriptions
     * when component gets destroyed.
     */
    private readonly _destroy: Subject<void> = new Subject();

    constructor(
        private readonly dialog: SCNGXDialogService,
        private readonly httpClient: HttpClient,
        private readonly importService: SCSDKImportService,
        private readonly gateway: SCSDKGeneralGateway
    ) {}

    public readonly datasource: SCNGXDatasource<SpotifyImport> = new SCNGXDatasource(this.httpClient, `${environment.api_base_uri}/v1/imports/spotify`, 8);

    public ngOnInit(): void {
        this.gateway.$onImportTaskUpdate.pipe(takeUntil(this._destroy), filter((task) => task.type == ImportTaskType.SPOTIFY_PLAYLIST)).subscribe((task: SpotifyImport) => {
            if(task.status == ImportTaskStatus.ENQUEUED || task.status == ImportTaskStatus.PROCESSING) {
                this.datasource.updateOrAppendById(task.id, task);
            } else {
                this.datasource.removeById(task.id);
            }
        });
    }

    public ngOnDestroy(): void {
        this._destroy.next();
        this._destroy.complete();
    }

    public openCreateImportDialog(datasource: SCNGXDatasource<ImportTask>) {
        this.dialog.open(AppImportSpotifyCreateDialog).$afterClosed.pipe(takeUntil(this._destroy)).subscribe(async (data: ImportTask) => {
            if(!data) return;
            datasource.append(data);
        });
    }


}