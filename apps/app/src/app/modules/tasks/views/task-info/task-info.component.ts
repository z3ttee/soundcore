import { NestedTreeControl } from "@angular/cdk/tree";
import { HttpClient } from "@angular/common/http";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatTreeNestedDataSource } from "@angular/material/tree";
import { ActivatedRoute } from "@angular/router";
import { Future, RunStatus, SCSDKTaskGateway, SCSDKTasksService, Stage, Step, Task } from "@soundcore/sdk";
import { combineLatest, filter, map, Observable, startWith, Subject, switchMap, takeUntil, tap } from "rxjs";

interface TaskInfoViewProps {
    task?: Future<Task>;
}

interface StageTreeNode {
    isStage: boolean;
    data: Stage | Step;
    index: number;
    children?: StageTreeNode[];
}

@Component({
    templateUrl: "./task-info.component.html",
    styleUrls: [ "./task-info.component.scss" ]
})
export class TaskInfoView implements OnInit, OnDestroy {

    stageControl = new NestedTreeControl<StageTreeNode>(node => node.children);
    dataSource = new MatTreeNestedDataSource<StageTreeNode>();

    hasChild = (_: number, node: StageTreeNode) => !!node.children && node.children.length > 0;
    
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
        tap((props) => {
            this.dataSource.data = props.task.data?.stages?.map((stage, index): StageTreeNode => {
                return {
                    isStage: true,
                    data: stage,
                    index: index,
                    children: [
                        ...(stage.steps.map((step, i): StageTreeNode => {
                            return {
                                isStage: false,
                                index: i,
                                data: step,
                            }
                        }))
                    ]
                }
            });
        }),
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