import { Component, EventEmitter, Output } from "@angular/core";

@Component({
    selector: "scngx-chip",
    templateUrl: "./chips.component.html"
})
export class SCNGXChipsComponent {

    @Output()
    public onclose: EventEmitter<void> = new EventEmitter();

}