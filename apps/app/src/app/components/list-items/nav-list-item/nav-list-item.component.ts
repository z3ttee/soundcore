import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { IsActiveMatchOptions } from "@angular/router";
import { Artwork } from "@repo/angular-sdk";

@Component({
    selector: "scngx-nav-list-item",
    templateUrl: "./nav-list-item.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
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