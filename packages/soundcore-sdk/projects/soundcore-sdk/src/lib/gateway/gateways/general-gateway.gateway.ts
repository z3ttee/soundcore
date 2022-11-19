import { Inject, Injectable } from "@angular/core";
import { SSOService } from "@soundcore/sso";
import { SCDKOptions, SCDK_OPTIONS } from "../../scdk.module";
import { SCSDKAuthenticatedGateway } from "./gateway";

@Injectable()
export class SCSDKGeneralGateway extends SCSDKAuthenticatedGateway {

  constructor(
    ssoService: SSOService,
    @Inject(SCDK_OPTIONS) private readonly options: SCDKOptions
  ) {
      super(new URL(`${options.api_base_uri}/general`), ssoService);
  }

  protected registerEvents(): void {
      
  }

}