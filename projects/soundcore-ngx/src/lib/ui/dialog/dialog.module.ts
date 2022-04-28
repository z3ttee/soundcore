import { NgModule } from "@angular/core";
import { MatDialogModule } from '@angular/material/dialog';
import { SCNGXDialogConfirmComponent } from "./dialogs/confirm/dialog-confirm.component";
import { SCNGXDialogTemplateComponent } from "./dialogs/template/dialog-template.component";
import { SCNGXDialogService } from "./services/dialog.service";

@NgModule({
    declarations: [
        SCNGXDialogTemplateComponent,
        SCNGXDialogConfirmComponent
    ],
    providers: [
        SCNGXDialogService
    ],
    imports: [
        MatDialogModule
    ]
})
export class SCNGXDialogModule {}