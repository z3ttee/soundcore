import { Component, Input } from "@angular/core";
import { SCNGXDatasource } from "../entities/datasource.entity";

@Component({
    selector: "scngx-scroll",
    templateUrl: "./scroll-wrapper.component.html"
})
export class SCNGXScrollWrapperComponent {

    @Input()
    public datasource: SCNGXDatasource<any>;

}