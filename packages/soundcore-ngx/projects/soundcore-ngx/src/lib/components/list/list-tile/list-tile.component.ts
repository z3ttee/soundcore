import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

@Component({
    selector: "scngx-list-tile",
    templateUrl: "./list-tile.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SCNGXListTileComponent {

    @Input()
    public title: string;

    @Input()
    public subtitle: string;

}