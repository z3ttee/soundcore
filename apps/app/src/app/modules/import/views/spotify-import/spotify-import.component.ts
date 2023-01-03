import { ChangeDetectionStrategy, Component, OnDestroy } from "@angular/core";
import { Subject } from "rxjs";

@Component({
    templateUrl: "./spotify-import.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpotifyImportView implements OnDestroy {

    /**
     * Subject used to destroy internal subscriptions
     * when component gets destroyed.
     */
    private readonly _destroy: Subject<void> = new Subject();

    public ngOnDestroy(): void {
        this._destroy.next();
        this._destroy.complete();
    }
}