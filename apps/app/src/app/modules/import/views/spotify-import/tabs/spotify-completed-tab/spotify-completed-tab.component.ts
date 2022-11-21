import { HttpClient } from "@angular/common/http";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { SCNGXDatasource } from "@soundcore/ngx";
import { ImportTask, ImportTaskStatus, ImportTaskType, SCSDKGeneralGateway } from "@soundcore/sdk";
import { filter, Subject, takeUntil } from "rxjs";
import { environment } from "src/environments/environment";

@Component({
    templateUrl: "./spotify-completed-tab.component.html"
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
    public datasource: SCNGXDatasource<ImportTask>;

    constructor(
        private readonly httpClient: HttpClient,
        private readonly gateway: SCSDKGeneralGateway
    ) {}

    public ngOnInit(): void {
        this.datasource = new SCNGXDatasource(this.httpClient, {
            url: `${environment.api_base_uri}/v1/imports/spotify/completed`
        });

        this.gateway.$onImportTaskUpdate.pipe(takeUntil(this._destroy), filter((task) => task.type == ImportTaskType.SPOTIFY_PLAYLIST)).subscribe((task) => {
            console.log(`Received task update.`, task);

            if(task.status == ImportTaskStatus.OK) {
                this.datasource.appendOrReplace(task);
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