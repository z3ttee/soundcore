import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { IconName, NgIcon } from "@ng-icons/core";

@Component({
    selector: "app-drawer-nav-item",
    templateUrl: "./drawer-nav-item.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, RouterLinkActive, NgIcon]
})
export class DrawerNavItemComponent {
    public readonly route = input<string | any | any[]>();
    public readonly icon = input<IconName>();
    public readonly exact = input<boolean>(false);
}