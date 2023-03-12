import { ChangeDetectionStrategy, Component, OnDestroy } from "@angular/core";
import { SCNGXDialogService } from "@soundcore/ngx";
import { SCSDKFactoryResetService } from "@soundcore/sdk";
import { Observable, Subject, takeUntil } from "rxjs";

@Component({
    templateUrl: "./configurate-reset.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigurateResetView implements OnDestroy {

    private readonly $destroy: Subject<void> = new Subject();

    constructor(
        private readonly resetService: SCSDKFactoryResetService,
        private readonly dialog: SCNGXDialogService
    ) {}

    public confirmAllReset() {
        this.confirmReset("Beim Zurücksetzen der Datenbank werden alle gespeicherten Daten gelöscht. Zusätzlich werden Einträge aus der Suchmaschine entfernt. Registrierte Mounts sind davon nicht betroffen. Bitte beachte, dass nach dem Ausführen die Anwendung heruntergefahren wird. Je nach Konfiguration der Umgebung, erfolgt ein automatischer Neustart. Andernfalls muss der Service manuell gestartet werden.").subscribe((confirmed) => {
            if(confirmed) {
                this.resetService.resetAll().pipe(takeUntil(this.$destroy)).subscribe((request) => {
                    if(request.error) {
                        console.error(request.error);
                        // TODO: Show snackbar
                    }
                });
            }
        });
    }

    public confirmSearchEngineReset() {
        this.confirmReset("Beim Zurücksetzen der Suchmaschine werden alle registrierten Dokumente gelöscht. Das bedeutet, dass alle möglichen Sucheinträge nicht mehr auffindbar sind. Im Anschluss wird eine erneute Indexierung der Musikbibliothek empfohlen, um die Suche wiederherzustellen. Bitte beachte, dass nach dem Ausführen die Anwendung heruntergefahren wird. Je nach Konfiguration der Umgebung, erfolgt ein automatischer Neustart. Andernfalls muss der Service manuell gestartet werden.").subscribe((confirmed) => {
            if(confirmed) {
                this.resetService.resetSearchEngine().pipe(takeUntil(this.$destroy)).subscribe((request) => {
                    if(request.error) {
                        console.error(request.error);
                        // TODO: Show snackbar
                    }
                });
            }
        });
    }

    private confirmReset(message: string): Observable<boolean> {
        return this.dialog.confirm(message).$afterClosed.pipe(takeUntil(this.$destroy));
    }

    public ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
    }

}