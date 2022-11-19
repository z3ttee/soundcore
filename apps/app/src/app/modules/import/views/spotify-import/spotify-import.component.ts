import { HttpClient } from "@angular/common/http";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { SCNGXDialogService } from "@soundcore/ngx";
import { ImportTask, ImportTaskStatus, SCSDKGeneralGateway } from "@soundcore/sdk";
import { Subject, takeUntil } from "rxjs";
import { AppImportSpotifyCreateDialog } from "src/app/dialogs/import-spotify-create-dialog/import-spotify-create-dialog.component";
import { SCNGXDatasource } from "src/app/modules/scroll/entities/datasource.entity";
import { environment } from "src/environments/environment";

@Component({
    templateUrl: "./spotify-import.component.html"
})
export class SpotifyImportView implements OnInit, OnDestroy {

    /**
     * Subject used to destroy internal subscriptions
     * when component gets destroyed.
     */
    private readonly _destroy: Subject<void> = new Subject();

    /**
     * Used to validate spotify urls.
     */
    private readonly spotifyBaseUrls: string[] = [
        "https://open.spotify.com/playlist/"
    ];

    constructor(
        private readonly httpClient: HttpClient,
        private readonly dialog: SCNGXDialogService,
        private readonly gateway: SCSDKGeneralGateway
    ) {}

    public openCreateImportDialog() {
        this.dialog.open(AppImportSpotifyCreateDialog).$afterClosed.pipe(takeUntil(this._destroy)).subscribe(async (data: ImportTask) => {
            console.log(data);
            if(!data) return;

            // await this.datasource.relax();
            await this.datasource.append(data);
        });
    }

    public loading: boolean = true;
    public datasource: SCNGXDatasource<ImportTask>;

    public ngOnInit(): void {
        this.datasource = new SCNGXDatasource(this.httpClient, {
            url: `${environment.api_base_uri}/v1/imports`,
            pageSize: 30
        });

        this.gateway.$onImportTaskUpdate.pipe(takeUntil(this._destroy)).subscribe((task) => {
            console.log("received task update: ", task);
            this.datasource.replaceById(task.id, task);
        });
    }

    public ngOnDestroy(): void {
        this._destroy.next();
        this._destroy.complete();
    }

    public replace(index: number, item: ImportTask) {

        // item.status = ImportTaskStatus.OK;
        // this.datasource.remove(index);
    }
}