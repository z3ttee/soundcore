import { HttpClient } from "@angular/common/http";
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";
import { SCNGXDatasource } from "@soundcore/ngx";
import { ImportTaskStatus, ImportTaskType, SCSDKGeneralGateway, SpotifyImport } from "@soundcore/sdk";
import { filter, Subject, takeUntil } from "rxjs";
import { environment } from "src/environments/environment";

@Component({
    templateUrl: "./spotify-failed-tab.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpotifyFailedTabComponent implements OnInit, OnDestroy {

    /**
     * Subject used to destroy internal subscriptions
     * when component gets destroyed.
     */
    private readonly _destroy: Subject<void> = new Subject();

    /**
     * Datasource to populate virtual scroller.
     */
    public readonly datasource: SCNGXDatasource<SpotifyImport> = new SCNGXDatasource(this.httpClient, `${environment.api_base_uri}/v1/imports/spotify/failed`, 8);

    constructor(
        private readonly httpClient: HttpClient,
        private readonly gateway: SCSDKGeneralGateway
    ) {}

    public ngOnInit(): void {
        this.gateway.$onImportTaskUpdate.pipe(takeUntil(this._destroy), filter((task) => task.type == ImportTaskType.SPOTIFY_PLAYLIST)).subscribe((task) => {
            if(task.status == ImportTaskStatus.ERRORED || task.status == ImportTaskStatus.SERVER_ABORT) {
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

}