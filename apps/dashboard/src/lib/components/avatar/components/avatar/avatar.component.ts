import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { ScAvatarBase } from "../../api/avatar";

@Component({
    selector: "sc-avatar",
    templateUrl: "./avatar.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: "inline-block align-middle w-11 rounded-full overflow-hidden max-w-full h-auto aspect-square"
    },
    providers: [
        {
            provide: ScAvatarBase,
            useExisting: ScAvatarComponent
        }
    ]
})
export class ScAvatarComponent extends ScAvatarBase {
    public readonly useInitials = input<string>();
}