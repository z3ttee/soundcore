import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { IsActiveMatchOptions } from "@angular/router";
import { Artwork } from "@soundcore/sdk";

@Component({
    selector: "scngx-nav-list-item",
    templateUrl: "./nav-list-item.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavListItemComponent {

    @Input()
    public iconName?: string;

    @Input()
    public iconSrc?: string;

    @Input()
    public artwork?: Artwork;

    @Input()
    public routerLink?: string | any[];

    @Input()
    public routerLinkActiveOptions?: {
        exact: boolean;
    } | IsActiveMatchOptions;

}