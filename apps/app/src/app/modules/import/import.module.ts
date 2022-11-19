import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatInputModule } from "@angular/material/input";
import { RouterModule, Routes } from "@angular/router";
import { SCNGXButtonModule, SCNGXDialogModule, SCNGXLabelModule, SCNGXScrollModule, SCNGXUiRowModule, SCNGXUiTitleModule } from "@soundcore/ngx";
import { SCSDKGatewayModule, SCSDKImportModule } from "@soundcore/sdk";
import { AppImportSpotifyCreateDialogModule } from "src/app/dialogs/import-spotify-create-dialog/import-spotify-create-dialog.module";
import { TaskStatusPipe } from "./pipes/task-status.pipe";
import { SpotifyImportView } from "./views/spotify-import/spotify-import.component";

const routes: Routes = [
    { path: "spotify", component: SpotifyImportView },
    { path: "**", redirectTo: "spotify" },
]

@NgModule({
    declarations: [
        SpotifyImportView,
        TaskStatusPipe
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        MatInputModule,

        SCNGXUiRowModule,
        SCNGXUiTitleModule,
        SCNGXLabelModule,
        SCNGXButtonModule,
        SCNGXScrollModule,
        SCSDKGatewayModule,

        SCSDKImportModule,
        AppImportSpotifyCreateDialogModule
    ]
})
export class ImportModule {}