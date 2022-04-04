import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IndexViewComponent } from './views/index-view/index-view.component';
import { DrawerComponent } from './components/drawer/drawer.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SidebarComponent } from './views/shared/sidebar/sidebar.component';
import { StoreModule } from '@ngrx/store';

import { HttpClientModule } from "@angular/common/http"

import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatDividerModule} from '@angular/material/divider';
import { AppCommonModule } from './common.module';
import { DeviceService } from './services/device.service';
import {MatProgressBarModule} from '@angular/material/progress-bar';

import { TeleportModule } from '@ngneat/overview';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { InfiniteScrollListComponent } from './components/lists/infinite-scroll-list/infinite-scroll-list.component';
import { StreamModule } from './features/stream/stream.module';
import { AscMessageModule } from './components/message-components/message-components.module';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import {ScrollingModule} from '@angular/cdk/scrolling';
import { AscPlaylistModule } from './components/playlist-components/playlist-components.module';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AscPlaylistEditorDialogModule } from './components/dialogs/playlist-editor-dialog/playlist-editor-dialog.module';
import { AscToolbarModule } from './components/toolbar/toolbar.module';
import { AscConfirmDialogModule } from './components/dialogs/confirm-dialog/confirm-dialog.module';
import { AuthModule } from 'src/sso/auth.module';
import { SCDKModule } from 'soundcore-sdk';
import { environment } from 'src/environments/environment';

// TODO: https://angular.io/guide/i18n-common-prepare

@NgModule({
  declarations: [
    InfiniteScrollListComponent,

    AppComponent,
    IndexViewComponent,
    MainLayoutComponent,
    DrawerComponent,
    SidebarComponent
  ],
  imports: [
    AuthModule,
    SCDKModule.forRoot({
      api_base_uri: environment.api_base_uri
    }),

    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    StoreModule.forRoot({}, {}),
    AppCommonModule,
    TeleportModule,
    InfiniteScrollModule,

    StreamModule,
    AscMessageModule,
    AscPlaylistModule,
    AscPlaylistEditorDialogModule,
    AscToolbarModule,
    AscConfirmDialogModule,

    // Import global Angular Material Components
    MatIconModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatInputModule,
    MatListModule,
    MatDividerModule,
    MatProgressBarModule,
    MatBottomSheetModule,
    ScrollingModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  providers: [
    DeviceService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
 }
