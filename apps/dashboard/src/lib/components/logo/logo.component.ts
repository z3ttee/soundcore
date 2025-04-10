import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
    selector: "sc-logo",
    templateUrl: "./logo.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: "inline-block align-middle w-10 max-w-full h-auto aspect-square"
    }
})
export class ScLogoComponent { }