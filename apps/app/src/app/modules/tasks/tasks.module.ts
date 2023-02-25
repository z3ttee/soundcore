import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SCNGXHorizontalListModule, SCNGXIconBtnModule, SCNGXScrollingModule, SCNGXUiRowModule, SCNGXUiSectionTitleModule, SCNGXUiTitleModule } from "@soundcore/ngx";
import { SCSDKTasksModule } from "@soundcore/sdk";
import { TasksIndexView } from "./views/tasks-index/tasks-index.component";
import { SCNGXTaskListItemModule } from "src/app/components/list-items/task-list-item/task-list-item.module";
import { NgIconsModule } from "@ng-icons/core";
import { heroArrowTopRightOnSquare } from '@ng-icons/heroicons/outline';

const routes: Routes = [
    { path: "", component: TasksIndexView }
];

@NgModule({
    declarations: [
        TasksIndexView
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        NgIconsModule.withIcons({ heroArrowTopRightOnSquare }),

        SCNGXScrollingModule,
        SCNGXUiTitleModule,
        SCNGXUiSectionTitleModule,
        SCNGXUiRowModule,
        SCNGXHorizontalListModule,
        SCNGXIconBtnModule,
        SCNGXTaskListItemModule,

        SCSDKTasksModule
    ]
})
export class TasksModule {}