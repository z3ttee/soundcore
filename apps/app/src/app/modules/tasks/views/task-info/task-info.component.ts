import { HttpClient } from "@angular/common/http";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Future, RunStatus, SCSDKTaskGateway, SCSDKTasksService, Stage, Step, Task } from "@soundcore/sdk";
import { combineLatest, filter, map, Observable, startWith, Subject, switchMap, takeUntil, tap } from "rxjs";

interface TaskInfoViewProps {
    task?: Future<Task>;
}

@Component({
    templateUrl: "./task-info.component.html",
})
export class TaskInfoView implements OnInit, OnDestroy {
    
    constructor(
        private readonly httpClient: HttpClient,
        private readonly activatedRoute: ActivatedRoute,
        private readonly taskService: SCSDKTasksService,
        private readonly taskGateway: SCSDKTaskGateway
    ) {}

    private readonly $destroy: Subject<void> = new Subject();
    private readonly $taskUpdate: Subject<Task> = new Subject();

    public readonly $taskRunId: Observable<string> = this.activatedRoute.paramMap.pipe(
        map((params) => params.get("runId"))
    );

    public readonly $props: Observable<TaskInfoViewProps> = combineLatest([
        this.$taskRunId.pipe(switchMap((runId) => {
            return this.taskService.findTaskByRunId(runId);
        })),
        this.$taskUpdate.pipe(startWith(null))
    ]).pipe(
        map(([task, taskUpdate]): TaskInfoViewProps => ({
            task: Future.merge(task, taskUpdate),
        })),
        takeUntil(this.$destroy)
    );

    public ngOnInit(): void {
        this.$taskRunId.pipe(
            switchMap((runId) => {
                return this.taskGateway.$onTasksUpdated.pipe(
                    tap(() => console.log("event received")),
                    map((tasks) => tasks.find((t) => t.runId === runId)), 
                    filter((task) => !!task), 
                    takeUntil(this.$destroy)
                );
            }),
            tap((task) => {
                console.log(task);
                this.$taskUpdate.next(task);
            }),
            takeUntil(this.$destroy)
        ).subscribe();
    }

    public ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
    }

    public getCurrentStepIndex(stage?: Stage): string {
        if(typeof stage?.currentStepId !== "string") return "-";
        return `${stage?.steps?.findIndex((s) => s.id === stage.currentStepId)}`;
    }

    public isWorking(obj?: Stage | Step): boolean {
        return obj?.status == RunStatus.WORKING;
    }
    
}