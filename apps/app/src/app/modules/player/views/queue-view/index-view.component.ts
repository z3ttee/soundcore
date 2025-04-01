import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
    templateUrl: "./index-view.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class QueueIndexViewComponent {}