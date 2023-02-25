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

    private currentProps: TasksIndexViewProps;

    private readonly $destroy: Subject<void> = new Subject();

    public readonly $props: Observable<TasksIndexViewProps> = combineLatest([
        of(new SCNGXDatasource<Task>(this.httpClient, this.taskService.findAllUrl(), 8)),
        this.taskService.findDefinitions(new Pageable(0, 10))
    ]).pipe(
        map(([datasource, definitions]): TasksIndexViewProps => ({
            datasource: datasource,
            definitions: definitions
        })),
        tap((val) => this.currentProps = val)
    );

    public ngOnInit(): void {
        this.taskGateway.$onTasksUpdated.pipe(takeUntil(this.$destroy)).subscribe((tasks) => {
            console.log(tasks);
        });
    }

    public ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
    }
    
}