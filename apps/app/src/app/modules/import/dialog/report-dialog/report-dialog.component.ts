import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";
import { DialogRef } from "@soundcore/ngx";
import { ApiError, FailedSpotifyImport, ImportReport, ImportSpotifyReport, SCSDKImportService, SpotifyImport, toFutureCompat } from "@soundcore/sdk";
import { combineLatest, map, Observable, Subject, takeUntil } from "rxjs";

export interface ReportDialogOptions {
    data: SpotifyImport;
}

interface ReportDialogProps {
    loading?: boolean;
    task?: SpotifyImport;
    report?: ImportReport<ImportSpotifyReport>;
    error?: ApiError;
}

@Component({
    templateUrl: "./report-dialog.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportDialogComponent implements OnDestroy {

    private readonly _destroy: Subject<void> = new Subject();

    constructor(
        public readonly dialogRef: DialogRef<ReportDialogOptions, SpotifyImport>,
        private readonly reportService: SCSDKImportService,
    ) {}

    public readonly $props: Observable<ReportDialogProps> = combineLatest([
        this.reportService.findReportByTaskid(this.dialogRef.config?.data?.data?.id).pipe(toFutureCompat(), takeUntil(this._destroy))
    ]).pipe(
        map(([request]): ReportDialogProps => ({
            loading: request.loading,
            task: this.dialogRef.config?.data?.data,
            report: (request.data as ImportReport<ImportSpotifyReport>),
            error: request.error
        })),
        takeUntil(this._destroy)
    );

    public ngOnDestroy(): void {
        this._destroy.next();
        this._destroy.complete();
    }

}