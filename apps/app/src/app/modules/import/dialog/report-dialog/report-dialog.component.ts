import { Component, OnDestroy, OnInit } from "@angular/core";
import { DialogRef, SCNGXOfflineDatasource } from "@soundcore/ngx";
import { FailedSpotifyImport, ImportReport, ImportSpotifyReport, SCSDKImportService, SpotifyImport } from "@soundcore/sdk";
import { Subject, takeUntil } from "rxjs";

export interface ReportDialogOptions {
    data: SpotifyImport;
}

@Component({
    templateUrl: "./report-dialog.component.html",
    styleUrls: ["./report-dialog.component.scss"]
})
export class ReportDialogComponent implements OnInit, OnDestroy {

    private readonly _destroy: Subject<void> = new Subject();

    public errorMessage?: string;
    public report?: ImportReport<ImportSpotifyReport>;
    public datasource?: SCNGXOfflineDatasource<FailedSpotifyImport>;
    public task: SpotifyImport;

    constructor(
        public readonly dialogRef: DialogRef<ReportDialogOptions, SpotifyImport>,
        private readonly reportService: SCSDKImportService,
    ) {}

    public ngOnInit(): void {
        this.task = this.dialogRef.config?.data?.data;

        if(typeof this.task === "undefined" || this.task == null) {
            this.dialogRef.close();
            return;
        }

        this.reportService.findReportByTaskid(this.task?.id).pipe(takeUntil(this._destroy)).subscribe((response) => {
            if(response.error) {
                this.errorMessage = response.message;
                return;
            }

            const report = response.payload as ImportReport<ImportSpotifyReport>;
            console.log(report);

            this.datasource = new SCNGXOfflineDatasource(report.data.notImportedSongs);

            console.log(this.datasource);
        })
    }

    public ngOnDestroy(): void {
        this._destroy.next();
        this._destroy.complete();
    }

}