
import { GATEWAY_MOUNT_UPDATE } from "@soundcore/constants";
import { SCSDKAuthenticatedGateway } from "./gateway";
import { Inject, Injectable } from "@angular/core";
import { SCDKOptions, SCDK_OPTIONS } from "../../scdk.module";
import { SSOService } from "@soundcore/sso";
import { MountStatusUpdateEvent } from "../events";
import { Observable, Subject } from "rxjs";

@Injectable()
export class SCSDKAdminGateway extends SCSDKAuthenticatedGateway {

  private readonly _mountStatusUpdateSubj: Subject<MountStatusUpdateEvent> = new Subject();
  public readonly $mountStatusUpdate: Observable<MountStatusUpdateEvent> = this._mountStatusUpdateSubj.asObservable();

  constructor(
    ssoService: SSOService,
    @Inject(SCDK_OPTIONS) private readonly options: SCDKOptions
  ) {
      super(new URL(`${options.api_base_uri}/admin`), ssoService);
  }

  protected registerEvents(): void {
    this.socket.on(GATEWAY_MOUNT_UPDATE, (event: MountStatusUpdateEvent) => {
      this._mountStatusUpdateSubj.next(event);
    })
  }

}