
import { GATEWAY_MOUNT_UPDATE } from "@soundcore/constants";
import { SCSDKAuthenticatedGateway } from "./gateway";
import { Inject, Injectable } from "@angular/core";
import { SCSDKOptions } from "../../scdk.module";
import { SSOService } from "@soundcore/sso";
import { MountStatusUpdateEvent } from "../events";
import { Observable, Subject } from "rxjs";
import { SCSDK_OPTIONS } from "../../constants";

@Injectable({
  providedIn: "root"
})
export class SCSDKAdminGateway extends SCSDKAuthenticatedGateway {

  private readonly _mountStatusUpdateSubj: Subject<MountStatusUpdateEvent> = new Subject();
  public readonly $mountStatusUpdate: Observable<MountStatusUpdateEvent> = this._mountStatusUpdateSubj.asObservable();

  constructor(
    ssoService: SSOService,
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