import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

export type SCNGXDividerVariant = "default" | "gradient";

@Component({
    selector: "scngx-divider",
    templateUrl: "./divider.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SCNGXDividerComponent {

    @Input() 
    public variant: SCNGXDividerVariant = "default";

    @Input()
    public reduced: boolean = true;

}