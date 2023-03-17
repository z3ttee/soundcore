import { ChangeDetectionStrategy, Component, OnDestroy } from "@angular/core";
import { DeviceInfo, Future, SCSDKMetricsService } from "@soundcore/sdk";
import { SSOService, SSOUser } from "@soundcore/sso";
import { combineLatest, map, Observable, Subject } from "rxjs";

interface DashboardIndexProps {
    account?: SSOUser;
    infoRequest?: Future<DeviceInfo>;
}

@Component({
    templateUrl: "./dashboard-index.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardIndexView implements OnDestroy {

    constructor(
        private readonly authService: SSOService,
        private readonly metricsService: SCSDKMetricsService
    ) {}

    private readonly $destroy: Subject<void> = new Subject();

    public readonly $props: Observable<DashboardIndexProps> = combineLatest([
        this.authService.$user,
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