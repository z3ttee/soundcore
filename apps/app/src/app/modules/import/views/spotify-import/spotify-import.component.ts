import { HttpClient } from "@angular/common/http";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { SCNGXDialogService } from "@soundcore/ngx";
import { ImportTask, SCSDKGeneralGateway } from "@soundcore/sdk";
import { Subject, takeUntil } from "rxjs";
import { AppImportSpotifyCreateDialog } from "src/app/dialogs/import-spotify-create-dialog/import-spotify-create-dialog.component";

@Component({
    templateUrl: "./spotify-import.component.html"
})
export class SpotifyImportView implements OnInit, OnDestroy {

    /**
     * Subject used to destroy internal subscriptions
     * when component gets destroyed.
     */
    private readonly _destroy: Subject<void> = new Subject();

    constructor(
        private readonly httpClient: HttpClient,
        private readonly dialog: SCNGXDialogService,
        private readonly gateway: SCSDKGeneralGateway
    ) {}

    public loading: boolean = true;

    public ngOnInit(): void {
        

        
    }

    public ngOnDestroy(): void {
        this._destroy.next();
        this._destroy.complete();
    }
}