import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Routes } from "@angular/router";
import { NgIconsModule } from "@ng-icons/core";
import { heroArrowTopRightOnSquare } from '@ng-icons/heroicons/outline';
import { SCNGXHorizontalListModule, SCNGXIconBtnModule, SCNGXScrollingModule, SCNGXUiRowModule, SCNGXUiSectionTitleModule, SCNGXUiTitleModule } from "@repo/angular-components";
import { SCSDKTasksModule } from "@repo/angular-sdk";
import { SCNGXTaskStatusIconModule } from "src/app/components/icons/task-status-icon/task-status-icon.module";
import { SCNGXTaskListItemModule } from "src/app/components/list-items/task-list-item/task-list-item.module";
import { TaskInfoView } from "./views/task-info/task-info.component";
import { TasksIndexView } from "./views/tasks-index/tasks-index.component";

const routes: Routes = [
    { path: "", component: TasksIndexView },
    { path: "run/:runId", component: TaskInfoView }

];

@NgModule({
    declarations: [
        TasksIndexView,
        TaskInfoView
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        NgIconsModule.withIcons({ heroArrowTopRightOnSquare }),

        MatIconModule,

        SCNGXScrollingModule,
        SCNGXUiTitleModule,
        SCNGXUiSectionTitleModule,
        SCNGXUiRowModule,
        SCNGXHorizontalListModule,
        SCNGXIconBtnModule,
        SCNGXTaskListItemModule,
        SCNGXTaskStatusIconModule,

        SCSDKTasksModule
    ]
})
export class TasksModule { }