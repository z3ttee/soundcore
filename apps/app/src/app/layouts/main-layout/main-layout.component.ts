import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { Location } from "@angular/common";
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";
import { UntypedFormControl } from "@angular/forms";
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from "@angular/router";
import { SSOService, SSOUser } from "@soundcore/sso";
import { combineLatest, filter, map, Observable, startWith, Subject, takeUntil, tap } from "rxjs";
import { SCCDKScreenService } from "@soundcore/cdk";
import { SCNGXDialogService } from "@soundcore/ngx";
import { Playlist, SCSDKGeneralGateway, SCSDKPlaylistService, SCSDKSearchService } from "@soundcore/sdk";
import { AppPlaylistCreateDialog } from "src/app/dialogs/playlist-create-dialog/playlist-create-dialog.component";
import { SCNGXPlaylistListItemComponent } from "src/app/components/list-items/playlist-list-item/playlist-list-item.component";

interface MainLayoutProps {
    playlists?: Playlist[];
    account?: SSOUser;

    isAdminAccount?: boolean;
    isModAccount?: boolean;
}

@Component({
    templateUrl: "./main-layout.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AscMainLayoutComponent implements OnInit, OnDestroy {

    private readonly _destroy: Subject<void> = new Subject();

    public readonly searchInputControl: UntypedFormControl = new UntypedFormControl("");

    public isNavigating: boolean = false;

    constructor(
        public readonly screenService: SCCDKScreenService,
        private readonly authService: SSOService,
        public readonly playlistService: SCSDKPlaylistService,
        private readonly dialogService: SCNGXDialogService,
        private readonly searchService: SCSDKSearchService,
        private readonly router: Router,
        private readonly _location: Location,
        public readonly gateway: SCSDKGeneralGateway
    ) {}

    public readonly $props: Observable<MainLayoutProps> = combineLatest([
        this.playlistService.$library.pipe(map((playlists) => ([...playlists]))),
        this.authService.$user.pipe(startWith(null)),
        combineLatest([
            this.authService.$isAdmin,
            this.authService.$isMod
        ])
    ]).pipe(
        map(([playlists, account, [isAdminAccount, isModAccount]]): MainLayoutProps => ({
            playlists: playlists,
            account: account,
            isAdminAccount: isAdminAccount,
            isModAccount: isAdminAccount || isModAccount
        })),
        takeUntil(this._destroy),
        tap((props) => console.log(props))
    );

    public ngOnInit(): void {
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
        // this.playlistService.movePosition(event.previousIndex, event.currentIndex);
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

    public openCreatePlaylistDialog() {       
        this.dialogService.open(AppPlaylistCreateDialog, {}).$afterClosed.pipe(takeUntil(this._destroy));
    }

    public logout() {
        this.authService.logout();
    }

}