import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { Location } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { UntypedFormControl } from "@angular/forms";
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from "@angular/router";
import { SCNGXPlaylistListItemComponent } from "projects/soundcore-ngx/src/public-api";
import { filter, firstValueFrom, Subject, takeUntil } from "rxjs";
import { SCNGXDialogService, SCNGXScreenService } from "soundcore-ngx";
import { Playlist, SCDKPlaylistService, SCDKSearchService } from "soundcore-sdk";
import { AppPlaylistCreateDialog } from "src/app/dialogs/playlist-create-dialog/playlist-create-dialog.component";
import { AuthenticationService } from "src/sso/services/authentication.service";

@Component({
    templateUrl: "./main-layout.component.html"
})
export class AscMainLayoutComponent implements OnInit, OnDestroy {

    private readonly _destroy: Subject<void> = new Subject();

    public readonly searchInputControl: UntypedFormControl = new UntypedFormControl("");

    public isNavigating: boolean = false;

    constructor(
        public readonly screenService: SCNGXScreenService,
        public readonly authService: AuthenticationService,
        public readonly playlistService: SCDKPlaylistService,
        private readonly dialogService: SCNGXDialogService,
        private readonly searchService: SCDKSearchService,
        private readonly router: Router,
        private readonly _location: Location
    ) {}

    public ngOnInit(): void {
        firstValueFrom(this.playlistService.findByCurrentUser()).then((page) => {
            console.log(page)
        })

        // Subscribe to router events to show a loader bar at the page top
        // This indicates the user that the page is loading parts of the app
        // that are needed for operation
        this.router.events.pipe(filter((event) => event instanceof NavigationStart || event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError), takeUntil(this._destroy)).subscribe((event) => {
            if(event instanceof NavigationStart) {
                this.isNavigating = true;
            } else {
                this.isNavigating = false;
            }
        })

        // Subscribe to input changes and emit globally to handle query
        this.searchInputControl.valueChanges.pipe(takeUntil(this._destroy)).subscribe((value) => {
            this.searchService.emitMainInput(value);
        })
    }

    public ngOnDestroy(): void {
        this._destroy.next();
        this._destroy.complete();
    }

    public onPlaylistItemDrop(event: CdkDragDrop<SCNGXPlaylistListItemComponent, Playlist>) {
        this.playlistService.movePosition(event.previousIndex, event.currentIndex);
    }

    public navigateBack() {
        this._location.back();
    }
    
    public navigateNext() {
        this._location.forward();
    }

    public navigateToSearch() {
        this.router.navigate(['/search']).then((value) => {
            // Only emit, if the prev route was not already /search
            if(value) this.searchService.emitMainInput(this.searchInputControl.value);
        })
    }

    public openTestDialog() {       
        this.dialogService.open(AppPlaylistCreateDialog, {}).$afterClosed.pipe(takeUntil(this._destroy)).subscribe((playlist) => {
            console.log(playlist);
        })
    }

}