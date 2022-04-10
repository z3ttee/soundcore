import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { Location } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { SCNGXPlaylistListItemComponent } from "projects/soundcore-ngx/src/public-api";
import { firstValueFrom } from "rxjs";
import { SCNGXScreenService } from "soundcore-ngx";
import { Playlist, SCDKPlaylistService } from "soundcore-sdk";
import { AuthenticationService } from "src/sso/services/authentication.service";

@Component({
    templateUrl: "./main-layout.component.html"
})
export class AscMainLayoutComponent implements OnInit {

    constructor(
        public readonly screenService: SCNGXScreenService,
        public readonly authService: AuthenticationService,
        public readonly playlistService: SCDKPlaylistService,
        private _location: Location
    ) {}

    public ngOnInit(): void {
        firstValueFrom(this.playlistService.findByCurrentUser()).then((page) => {
            console.log(page)
        })
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

}