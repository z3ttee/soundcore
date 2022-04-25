import { Inject, Injectable } from "@angular/core";
import { KeycloakService } from "keycloak-angular";
import { Observable, Subject, takeUntil } from "rxjs";
import { SCDKOptions, SCDK_OPTIONS } from "../../scdk.module";
import { SCDKAuthenticatedGateway } from "../../utils/gateway/gateway";
import { Notification } from "../entities/notification.entity";

export const NOTIFICATION_EVENT_PUSH = "notification:push";

@Injectable()
export class SCDKNotificationGateway extends SCDKAuthenticatedGateway {

    private _destroy: Subject<void> = new Subject();

    private _notificationReceivedSubject: Subject<Notification> = new Subject();
    public $onNotificationReceived: Observable<Notification> = this._notificationReceivedSubject.asObservable().pipe(takeUntil(this._destroy));

    constructor(
        protected override readonly keycloakService: KeycloakService,
        @Inject(SCDK_OPTIONS) private readonly options: SCDKOptions
    ) {
        super(new URL(`${options.api_base_uri}/notifications`), keycloakService);
    }

    protected init(): void {
        this.socket.on(NOTIFICATION_EVENT_PUSH, (notification: Notification) => this._notificationReceivedSubject.next(notification));
    }

    public disconnect(): void {
        this._destroy.next();
        this._destroy.complete();

        this.socket.disconnect();
    }

}