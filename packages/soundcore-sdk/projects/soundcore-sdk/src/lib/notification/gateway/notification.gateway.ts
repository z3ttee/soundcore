import { Inject, Injectable } from "@angular/core";
import { Observable, Subject, takeUntil } from "rxjs";
<<<<<<< HEAD
import { SCSDKOptions, SCSDK_OPTIONS } from "../../scdk.module";
=======
import { SCSDKOptions } from "../../scdk.module";
>>>>>>> main
import { Notification } from "../entities/notification.entity";
import { SSOService } from "@soundcore/sso";
import { SCSDKAuthenticatedGateway } from "../../gateway/gateways/gateway";
import { SCSDK_OPTIONS } from "../../constants";

export const NOTIFICATION_EVENT_PUSH = "notification:push";

@Injectable()
export class SCDKNotificationGateway extends SCSDKAuthenticatedGateway {

    private _destroy: Subject<void> = new Subject();

    private _notificationReceivedSubject: Subject<Notification> = new Subject();
    public $onNotificationReceived: Observable<Notification> = this._notificationReceivedSubject.asObservable().pipe(takeUntil(this._destroy));

    constructor(
        ssoService: SSOService,
        @Inject(SCSDK_OPTIONS) private readonly options: SCSDKOptions
    ) {
        super(new URL(`${options.api_base_uri}/notifications`), ssoService);
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