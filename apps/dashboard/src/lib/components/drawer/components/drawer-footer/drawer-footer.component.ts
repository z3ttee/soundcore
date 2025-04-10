import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ScDrawerFooterBase } from "../../api/drawer-footer";

@Component({
    selector: "sc-drawer-footer",
    templateUrl: "./drawer-footer.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: ScDrawerFooterBase,
            useExisting: ScDrawerFooterComponent
        }
    ]
})
export class ScDrawerFooterComponent extends ScDrawerFooterBase {

}