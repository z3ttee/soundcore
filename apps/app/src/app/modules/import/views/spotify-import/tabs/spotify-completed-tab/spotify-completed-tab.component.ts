import { HttpClient } from "@angular/common/http";
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";
import { SCNGXDatasource, SCNGXDialogService } from "@soundcore/ngx";
import { ImportTaskStatus, ImportTaskType, SCSDKGeneralGateway, SpotifyImport } from "@soundcore/sdk";
import { filter, Subject, takeUntil } from "rxjs";
import { ReportDialogComponent, ReportDialogOptions } from "src/app/modules/import/dialog/report-dialog/report-dialog.component";
import { environment } from "src/environments/environment";

@Component({
    templateUrl: "./spotify-completed-tab.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpotifyCompletedTabComponent implements OnInit, OnDestroy {

    /**
     * Subject used to destroy internal subscriptions
     * when component gets destroyed.
     */
    private readonly _destroy: Subject<void> = new Subject();

    /**
     * Datasource to populate virtual scroller.
     */
    public readonly datasource: SCNGXDatasource<SpotifyImport> = new SCNGXDatasource(this.httpClient, `${environment.api_base_uri}/v1/imports/spotify/completed`, 8);

    constructor(
        private readonly httpClient: HttpClient,
        private readonly gateway: SCSDKGeneralGateway,
        private readonly dialog: SCNGXDialogService
    ) {}

    public ngOnInit(): void {
        this.gateway.$onImportTaskUpdate.pipe(takeUntil(this._destroy), filter((task) => task.type == ImportTaskType.SPOTIFY_PLAYLIST)).subscribe((task) => {
            if(task.status == ImportTaskStatus.OK) {
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

    public openReportDialog(task: SpotifyImport) {       
        this.dialog.open<ReportDialogComponent, ReportDialogOptions, any>(ReportDialogComponent, { data: {
            data: task
        }});
    }

}