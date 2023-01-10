import { Inject, Injectable } from "@angular/core";
import { SSOService } from "@soundcore/sso";
import { Observable, Subject } from "rxjs";
import { GATEWAY_EVENT_IMPORTTASK_UPDATE } from "../../constants";
import { ImportTask } from "../../import/entities/import.entity";
import { SCDKOptions, SCDK_OPTIONS } from "../../scdk.module";
import { ImportTaskUpdateEvent } from "../events/importtask-update.event";
import { SCSDKAuthenticatedGateway } from "./gateway";

@Injectable({
  providedIn: "root"
})
export class SCSDKGeneralGateway extends SCSDKAuthenticatedGateway {

  private readonly _importTaskUpdateSubj: Subject<ImportTask> = new Subject();
  public readonly $onImportTaskUpdate: Observable<ImportTask> = this._importTaskUpdateSubj.asObservable();

  constructor(
    ssoService: SSOService,
    @Inject(SCDK_OPTIONS) private readonly options: SCDKOptions
  ) {
      super(new URL(`${options.api_base_uri}/general`), ssoService);
  }

  protected registerEvents(): void {
      this.socket.on(GATEWAY_EVENT_IMPORTTASK_UPDATE, (event: ImportTaskUpdateEvent) => {
        console.log(event);

        this._importTaskUpdateSubj.next(event.payload);
      })
  }

}