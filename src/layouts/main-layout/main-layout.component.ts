import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { Location } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from "@angular/router";
import { SCNGXPlaylistListItemComponent } from "projects/soundcore-ngx/src/public-api";
import { filter, firstValueFrom, Subject, takeUntil } from "rxjs";
import { SCNGXScreenService } from "soundcore-ngx";
import { Playlist, SCDKPlaylistService } from "soundcore-sdk";
import { AuthenticationService } from "src/sso/services/authentication.service";

@Component({
    templateUrl: "./main-layout.component.html"
})
export class AscMainLayoutComponent implements OnInit, OnDestroy {

    private _destroy: Subject<void> = new Subject();
    public isNavigating: boolean = false;

    constructor(
        public readonly screenService: SCNGXScreenService,
        public readonly authService: AuthenticationService,
        public readonly playlistService: SCDKPlaylistService,
        private readonly router: Router,
        private readonly _location: Location
    ) {}

    public ngOnInit(): void {
        firstValueFrom(this.playlistService.findByCurrentUser()).then((page) => {
            console.log(page)
        })

        this.router.events.pipe(filter((event) => event instanceof NavigationStart || event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError), takeUntil(this._destroy)).subscribe((event) => {
            if(event instanceof NavigationStart) {
                this.isNavigating = true;
            } else {
                this.isNavigating = false;
            }

            console.log(this.isNavigating)
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
        this.router.navigate(['/search'])
    }

}