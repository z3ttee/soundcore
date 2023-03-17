import { Inject, Injectable } from "@angular/core";
import { SSOService } from "@soundcore/sso";
import { Observable, Subject } from "rxjs";
import { GATEWAY_EVENT_TASK_EMIT, SCSDK_OPTIONS } from "../../constants";
import { SCSDKAuthenticatedGateway } from "../../gateway/gateways/gateway";
<<<<<<< HEAD
import { SCSDKOptions, SCSDK_OPTIONS } from "../../scdk.module";
=======
import { SCSDKOptions } from "../../scdk.module";
>>>>>>> main
import { Task } from "../entities/task.entity";

@Injectable({
    providedIn: "root"
})
export class SCSDKTaskGateway extends SCSDKAuthenticatedGateway {
  
    private readonly _tasksUpdateSubj: Subject<Task[]> = new Subject();
    public readonly $onTasksUpdated: Observable<Task[]> = this._tasksUpdateSubj.asObservable();
  
    constructor(
      ssoService: SSOService,
      @Inject(SCSDK_OPTIONS) private readonly options: SCSDKOptions
    ) {
        super(new URL(`${options.api_base_uri}/tasks`), ssoService);
    }
  
    protected registerEvents(): void {
        this.socket.on(GATEWAY_EVENT_TASK_EMIT, (tasks: Task[]) => {
            console.log(tasks);
            this._tasksUpdateSubj.next(tasks);
        })
    }
  
}