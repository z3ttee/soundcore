import { Component, Input } from "@angular/core";

@Component({
    selector: "scngx-tabs",
    templateUrl: "./tabs.component.html"
})
export class SCNGXTabsComponent {

    @Input()
    public transparent: boolean = false;

}