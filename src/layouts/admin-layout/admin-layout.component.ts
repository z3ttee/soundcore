import { Location } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject } from "rxjs";
import { SCCDKScreenService } from "soundcore-cdk";
import { AuthenticationService } from "src/sso/services/authentication.service";

@Component({
    templateUrl: "./admin-layout.component.html"
})
export class AdminLayoutComponent implements OnInit, OnDestroy {

    private readonly _destroy: Subject<void> = new Subject();

    public isNavigating: boolean = false;

    constructor(
        public readonly screenService: SCCDKScreenService,
        public readonly authService: AuthenticationService,
        public readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly _location: Location
    ) {}

    public ngOnInit(): void {}
    public ngOnDestroy(): void {
        this._destroy.next();
        this._destroy.complete();
    }

    public navigateBack() {
        this._location.back();
    }
    
    public navigateNext() {
        this._location.forward();
    }

}
