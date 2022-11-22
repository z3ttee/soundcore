import { Component, Input } from "@angular/core";
import { SCNGXBaseDatasource } from "../entities/base-datasource.entity";

@Component({
    selector: "scngx-scroll",
    templateUrl: "./scroll-wrapper.component.html"
})
export class SCNGXScrollWrapperComponent {

    @Input()
    public datasource: SCNGXBaseDatasource<any>;

}