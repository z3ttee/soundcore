import { HttpClient } from "@angular/common/http";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { SCNGXDatasource, SCNGXDialogService } from "@soundcore/ngx";
import { ImportTask, ImportTaskStatus, ImportTaskType, SCSDKGeneralGateway, SCSDKImportService } from "@soundcore/sdk";
import { filter, Subject, takeUntil } from "rxjs";
import { AppImportSpotifyCreateDialog } from "src/app/dialogs/import-spotify-create-dialog/import-spotify-create-dialog.component";
import { environment } from "src/environments/environment";

@Component({
    templateUrl: "./spotify-pending-tab.component.html"
})
export class SpotifyPendingTabComponent implements OnInit, OnDestroy {

    /**
     * Subject used to destroy internal subscriptions
     * when component gets destroyed.
     */
    private readonly _destroy: Subject<void> = new Subject();

    /**
     * Datasource to populate virtual scroller.
     */
    public datasource: SCNGXDatasource<ImportTask>;

    constructor(
        private readonly dialog: SCNGXDialogService,
        private readonly httpClient: HttpClient,
        private readonly importService: SCSDKImportService,
        private readonly gateway: SCSDKGeneralGateway
    ) {}

    public ngOnInit(): void {
        this.datasource = new SCNGXDatasource(this.httpClient, {
            url: `${environment.api_base_uri}/v1/imports/spotify`
        });

        this.gateway.$onImportTaskUpdate.pipe(takeUntil(this._destroy), filter((task) => task.type == ImportTaskType.SPOTIFY_PLAYLIST)).subscribe((task) => {
            console.log(`Received task update.`, task);

            if(task.status == ImportTaskStatus.ENQUEUED || task.status == ImportTaskStatus.PROCESSING) {
                this.datasource.appendOrReplace(task);
            } else {
                this.datasource.removeById(task.id);
            }
        });

        this.datasource.$size.subscribe((size) => {
            console.log("size: ", size);
        })
    }

    public ngOnDestroy(): void {
        this._destroy.next();
        this._destroy.complete();
    }

    public openCreateImportDialog() {
        this.dialog.open(AppImportSpotifyCreateDialog).$afterClosed.pipe(takeUntil(this._destroy)).subscribe(async (data: ImportTask) => {
            if(!data) return;

            await this.datasource.append(data);
        });
    }


}