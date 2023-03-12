import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { NgIconsModule } from "@ng-icons/core";
import { heroCheckCircle, heroQueueList, heroArrowPath, heroXCircle, heroExclamationTriangle, heroForward } from "@ng-icons/heroicons/outline";
import { SCNGXTaskStatusIconComponent } from "./task-status-icon.component";

@NgModule({
    declarations: [
        SCNGXTaskStatusIconComponent
    ],
    imports: [
        CommonModule,
        NgIconsModule.withIcons({ heroCheckCircle, heroQueueList, heroArrowPath, heroXCircle, heroExclamationTriangle, heroForward }),
    ],
    exports: [
        SCNGXTaskStatusIconComponent
    ]
})
export class SCNGXTaskStatusIconModule {}