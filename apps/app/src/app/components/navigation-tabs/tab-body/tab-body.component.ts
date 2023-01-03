import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

@Component({
    selector: "scngx-tab-body",
    templateUrl: "./tab-body.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SCNGXTabBodyComponent {

    @Input()
    public fullHeight: boolean = true;

}