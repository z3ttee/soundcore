import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ScDrawerContentBase } from "../../api/drawer-content";

@Component({
    selector: "sc-drawer-content",
    templateUrl: "./drawer-content.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: ScDrawerContentBase,
            useExisting: ScDrawerContentComponent
        }
    ]
})
export class ScDrawerContentComponent extends ScDrawerContentBase {

}