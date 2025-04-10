import { NgTemplateOutlet } from "@angular/common";
import { ChangeDetectionStrategy, Component, contentChild } from "@angular/core";
import { ScLogo } from "../../../logo";
import { ScDrawerBase } from "../../api/drawer";
import { ScDrawerContentBase } from "../../api/drawer-content";
import { ScDrawerFooterBase } from "../../api/drawer-footer";
import { ScDrawerSidebarBase } from "../../api/drawer-sidebar";

@Component({
    selector: "sc-drawer",
    templateUrl: "./drawer.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgTemplateOutlet, ScLogo],
    host: {
        class: "w-full h-full"
    },
    providers: [
        {
            provide: ScDrawerBase,
            useExisting: ScDrawerComponent
        }
    ]
})
export class ScDrawerComponent extends ScDrawerBase {
    protected readonly _sidebar = contentChild(ScDrawerSidebarBase);
    protected readonly _content = contentChild(ScDrawerContentBase);
    protected readonly _footer = contentChild(ScDrawerFooterBase);
}