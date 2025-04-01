
import { Inject, Injectable } from "@angular/core";
import { AuthenticationService } from "@repo/angular-oidc";
import { Observable, Subject } from "rxjs";
import { SCSDK_OPTIONS } from "../../constants";
import type { SCSDKOptions } from "../../scdk.module";
import { MountStatusUpdateEvent } from "../events";
import { SCSDKAuthenticatedGateway } from "./gateway";

export const GATEWAY_MOUNT_UPDATE = "soundcore-gateway-mount-update-event";

@Injectable({
  providedIn: "root"
})
export class SCSDKAdminGateway extends SCSDKAuthenticatedGateway {

  private readonly _mountStatusUpdateSubj: Subject<MountStatusUpdateEvent> = new Subject();
  public readonly $mountStatusUpdate: Observable<MountStatusUpdateEvent> = this._mountStatusUpdateSubj.asObservable();

  constructor(
    ssoService: AuthenticationService,
    @Inject(SCSDK_OPTIONS) options: SCSDKOptions
  ) {
    super(new URL(`${options.api_base_uri}/admin`), ssoService);
  }

  protected registerEvents(): void {
    this.socket.on(GATEWAY_MOUNT_UPDATE, (event: MountStatusUpdateEvent) => {
      this._mountStatusUpdateSubj.next(event);
    })
  }

}