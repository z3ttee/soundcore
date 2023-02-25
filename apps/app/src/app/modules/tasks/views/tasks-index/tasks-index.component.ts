import { HttpClient } from "@angular/common/http";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { SCNGXDatasource } from "@soundcore/ngx";
import { Future, Page, Pageable, SCSDKTaskGateway, SCSDKTasksService, Task, TaskDefinition } from "@soundcore/sdk";
import { combineLatest, map, Observable, of, Subject, takeUntil, tap } from "rxjs";

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

    private readonly datasource = new SCNGXDatasource<Task>(this.httpClient, this.taskService.findAllUrl(), 8);

    private readonly $destroy: Subject<void> = new Subject();

    public readonly $props: Observable<TasksIndexViewProps> = combineLatest([
        this.taskService.findDefinitions(new Pageable(0, 10))
    ]).pipe(
        map(([definitions]): TasksIndexViewProps => ({
            datasource: this.datasource,
            definitions: definitions
        }))
    );

    public ngOnInit(): void {
        this.taskGateway.$onTasksUpdated.pipe(takeUntil(this.$destroy)).subscribe((tasks) => {
            console.log(tasks);
            for(const task of tasks){
                this.datasource.updateOrPrependById(task.id, task);
            }
        });
    }

    public ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
    }
    
}