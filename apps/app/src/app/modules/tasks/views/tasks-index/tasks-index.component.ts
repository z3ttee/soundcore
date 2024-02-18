import { HttpClient } from "@angular/common/http";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Page, Pageable } from "@soundcore/common";
import { SCNGXDatasource } from "@soundcore/ngx";
import { Future, SCSDKTaskGateway, SCSDKTasksService, Task, TaskDefinition } from "@soundcore/sdk";
import { combineLatest, map, Observable, Subject, takeUntil } from "rxjs";

interface TasksIndexViewProps {
    datasource?: SCNGXDatasource;
    definitions?: Future<Page<TaskDefinition>>;
}

@Component({
    templateUrl: "./tasks-index.component.html"
})
export class TasksIndexView implements OnInit, OnDestroy {

    constructor(
        private readonly httpClient: HttpClient,
        private readonly taskService: SCSDKTasksService,
        private readonly taskGateway: SCSDKTaskGateway
    ) {}

    private readonly datasource = new SCNGXDatasource<Task>(this.httpClient, this.taskService.findAllUrl(), 8, null, "runId");
    private readonly $destroy: Subject<void> = new Subject();

    public readonly $props: Observable<TasksIndexViewProps> = combineLatest([
        this.taskService.findDefinitions(new Pageable(0, 10))
    ]).pipe(
        map(([definitions]): TasksIndexViewProps => ({
            datasource: this.datasource,
            definitions: definitions
        })),
        takeUntil(this.$destroy)
    );

    public ngOnInit(): void {
        this.taskGateway.$onTasksUpdated.pipe(takeUntil(this.$destroy)).subscribe((tasks) => {
            for(const task of tasks){
                this.datasource.updateOrPrependById(task.runId, task);
            }
        });
    }

    public ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
    }
    
}