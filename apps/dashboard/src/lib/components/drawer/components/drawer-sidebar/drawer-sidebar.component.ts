import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ScDrawerSidebarBase } from "../../api/drawer-sidebar";

@Component({
    selector: "sc-drawer-sidebar",
    templateUrl: "./drawer-sidebar.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: ScDrawerSidebarBase,
            useExisting: ScDrawerSidebarComponent
        }
    ]
})
export class ScDrawerSidebarComponent extends ScDrawerSidebarBase {

}