import { ChangeDetectionStrategy, Component, OnDestroy } from "@angular/core";
import { AuthenticationService, Profile } from "@repo/angular-oidc";
import { DeviceInfo, SCSDKMetricsService } from "@repo/angular-sdk";
import { Future } from "@repo/utilities";
import { combineLatest, map, Observable, Subject } from "rxjs";

interface DashboardIndexProps {
    account?: Profile;
    infoRequest?: Future<DeviceInfo>;
}

@Component({
    templateUrl: "./dashboard-index.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DashboardIndexView implements OnDestroy {

    constructor(
        private readonly authService: AuthenticationService,
        private readonly metricsService: SCSDKMetricsService
    ) { }

    private readonly $destroy: Subject<void> = new Subject();

    public readonly $props: Observable<DashboardIndexProps> = combineLatest([
        this.authService.$profile,
        this.metricsService.findDeviceInfo()
    ]).pipe(
        map(([user, infoRequest]): DashboardIndexProps => ({
            account: user,
            infoRequest: infoRequest
        }))
    );

    public ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
    }

}