import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatInputModule } from "@angular/material/input";
import { RouterModule, Routes } from "@angular/router";
import { FaIconLibrary, FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { SCNGXArtworkModule, SCNGXButtonModule, SCNGXDialogModule, SCNGXLabelModule, SCNGXScrollingModule, SCNGXSkeletonModule, SCNGXUiRowModule, SCNGXUiTitleModule } from "@soundcore/ngx";
import { SCSDKGatewayModule, SCSDKImportModule } from "@soundcore/sdk";
import { SCNGXTabsModule } from "src/app/components/navigation-tabs";
import { AppImportSpotifyCreateDialogModule } from "src/app/dialogs/import-spotify-create-dialog/import-spotify-create-dialog.module";
import { SpotifyImportItemComponent } from "./components/spotify-import-item/spotify-import-item.component";
import { TaskStatusPipe } from "./pipes/task-status.pipe";
import { SpotifyImportView } from "./views/spotify-import/spotify-import.component";
import { SpotifyCompletedTabComponent } from "./views/spotify-import/tabs/spotify-completed-tab/spotify-completed-tab.component";
import { SpotifyFailedTabComponent } from "./views/spotify-import/tabs/spotify-failed-tab/spotify-failed-tab.component";
import { SpotifyPendingTabComponent } from "./views/spotify-import/tabs/spotify-pending-tab/spotify-pending-tab.component";
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import { ReportDialogComponent } from "./dialog/report-dialog/report-dialog.component";
import { FailedReasonPipe } from "./pipes/failed-reason.pipe";

const routes: Routes = [
    { path: "spotify", component: SpotifyImportView, children: [
        { path: "", component: SpotifyPendingTabComponent },
        { path: "completed", component: SpotifyCompletedTabComponent },
        { path: "failed", component: SpotifyFailedTabComponent }
    ]},
    { path: "**", redirectTo: "spotify" },
]

@NgModule({
    declarations: [
        SpotifyImportView,
        TaskStatusPipe,
        FailedReasonPipe,

        SpotifyPendingTabComponent,
        SpotifyCompletedTabComponent,
        SpotifyFailedTabComponent,

        SpotifyImportItemComponent,

        ReportDialogComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FontAwesomeModule,

        MatInputModule,

        SCNGXUiRowModule,
        SCNGXUiTitleModule,
        SCNGXLabelModule,
        SCNGXButtonModule,
        SCNGXTabsModule,
        SCNGXArtworkModule,
        SCNGXDialogModule,
        SCNGXScrollingModule,
        SCNGXSkeletonModule,

        SCSDKGatewayModule,

        SCSDKImportModule,
        AppImportSpotifyCreateDialogModule
    ]
})
export class ImportModule {
    constructor(library: FaIconLibrary) {
        library.addIcons(faSpotify)
    }
}