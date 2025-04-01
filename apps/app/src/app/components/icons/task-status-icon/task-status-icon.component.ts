import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { RunStatus } from "@repo/angular-sdk";

@Component({
    selector: "scngx-task-status-icon",
    templateUrl: "./task-status-icon.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class SCNGXTaskStatusIconComponent {

    @Input()
    public status: RunStatus;

    @Input()
    public size: string = '22';

}