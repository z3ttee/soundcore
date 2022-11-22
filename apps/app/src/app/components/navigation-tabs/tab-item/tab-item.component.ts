import { Component, Input } from "@angular/core";

@Component({
    selector: "scngx-tab-item",
    templateUrl: "./tab-item.component.html"
})
export class SCNGXTabItemComponent {

    @Input() 
    public route: string | any[];

    @Input()
    public exactRoute: boolean = false;

    @Input()
    public isTouchDevice: boolean = false;
}