import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SCNGXHorizontalListModule, SCNGXIconBtnModule, SCNGXScrollingModule, SCNGXUiRowModule, SCNGXUiSectionTitleModule, SCNGXUiTitleModule } from "@soundcore/ngx";
import { SCSDKTasksModule } from "@soundcore/sdk";
import { TasksIndexView } from "./views/tasks-index/tasks-index.component";
import { SCNGXTaskListItemModule } from "src/app/components/list-items/task-list-item/task-list-item.module";
import { NgIconsModule } from "@ng-icons/core";
import { heroArrowTopRightOnSquare } from '@ng-icons/heroicons/outline';
import { TaskInfoView } from "./views/task-info/task-info.component";
import { SCNGXTaskStatusIconModule } from "src/app/components/icons/task-status-icon/task-status-icon.module";
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';

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

        MatTreeModule,
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
export class TasksModule {}