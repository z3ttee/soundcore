import { ChangeDetectionStrategy, Component, OnDestroy } from "@angular/core";
import { SCCDKScreenService } from "@soundcore/cdk";
import { combineLatest, map, Observable, Subject, takeUntil } from "rxjs";

interface CollectionViewProps {
    isTouchDevice?: boolean;
}

@Component({
    selector: "scngx-collection-view",
    templateUrl: "./collection-view.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SCNGXCollectionViewComponent implements OnDestroy {

    constructor(
        private readonly screen: SCCDKScreenService
    ) {}

    private readonly _destroy: Subject<void> = new Subject();

    public readonly $props: Observable<CollectionViewProps> = combineLatest([
        this.screen.$isTouch.pipe(takeUntil(this._destroy))
    ]).pipe(map(([isTouchDevice]): CollectionViewProps => ({
        isTouchDevice
    })));

    public ngOnDestroy(): void {
        this._destroy.next();
        this._destroy.complete();
    }

}