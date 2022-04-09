import { Component } from "@angular/core";
import { SCNGXScreenService } from "soundcore-ngx";
import { AuthenticationService } from "src/sso/services/authentication.service";

@Component({
    templateUrl: "./main-layout.component.html"
})
export class AscMainLayoutComponent {

    constructor(
        public readonly screenService: SCNGXScreenService,
        public readonly authService: AuthenticationService,
    ) {}

}