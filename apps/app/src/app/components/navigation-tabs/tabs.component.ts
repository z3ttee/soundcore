import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

@Component({
    selector: "scngx-tabs",
    templateUrl: "./tabs.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class SCNGXTabsComponent {

    @Input()
    public transparent: boolean = false;

    @Input()
    public fullHeight: boolean = true;

    @Input()
    public useParentPadding?: boolean;

}