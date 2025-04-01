import { Inject, Injectable } from "@angular/core";
import { AuthenticationService } from "@repo/angular-oidc";
import { Observable, Subject, takeUntil } from "rxjs";
import { SCSDK_OPTIONS } from "../../constants";
import { SCSDKAuthenticatedGateway } from "../../gateway/gateways/gateway";
import type { SCSDKOptions } from "../../scdk.module";
import { Notification } from "../entities/notification.entity";

export const NOTIFICATION_EVENT_PUSH = "notification:push";

@Injectable()
export class SCDKNotificationGateway extends SCSDKAuthenticatedGateway {

    private _destroy: Subject<void> = new Subject();

    private _notificationReceivedSubject: Subject<Notification> = new Subject();
    public $onNotificationReceived: Observable<Notification> = this._notificationReceivedSubject.asObservable().pipe(takeUntil(this._destroy));

    constructor(
        authService: AuthenticationService,
        @Inject(SCSDK_OPTIONS) options: SCSDKOptions
    ) {
        super(new URL(`${options.api_base_uri}/notifications`), authService);
    }

    protected registerEvents(): void {
        this.socket.on(NOTIFICATION_EVENT_PUSH, (notification: Notification) => this._notificationReceivedSubject.next(notification));
    }

    public disconnect(): void {
        this._destroy.next();
        this._destroy.complete();

        this.socket.disconnect();
    }

}