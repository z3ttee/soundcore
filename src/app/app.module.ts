import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IndexViewComponent } from './views/index-view/index-view.component';
import { DrawerComponent } from './components/drawer/drawer.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SidebarComponent } from './views/shared/sidebar/sidebar.component';
import { SplashComponent } from './views/splash/splash.component';
import { StoreModule } from '@ngrx/store';

import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http"
import { ToolbarComponent } from './views/shared/toolbar/toolbar.component';
import { AudioplayerModule } from './features/audioplayer/audioplayer.module';

import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatDividerModule} from '@angular/material/divider';
import { AppCommonModule } from './common.module';
import { DeviceService } from './services/device.service';
import { AccessTokenInterceptor } from './interceptors/access-token.interceptor';
import {MatProgressBarModule} from '@angular/material/progress-bar';


import { TeleportModule } from '@ngneat/overview';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { PlaylistListItemComponent } from './components/list-items/playlist-list-item/playlist-list-item.component';
import { PlaylistModule } from './features/playlist/playlist.module';

// TODO: https://angular.io/guide/i18n-common-prepare

@NgModule({
  declarations: [
    AppComponent,
    IndexViewComponent,
    MainLayoutComponent,
    DrawerComponent,
    SidebarComponent,
    ToolbarComponent,
    SplashComponent,
    PlaylistListItemComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AudioplayerModule,
    ReactiveFormsModule,
    StoreModule.forRoot({}, {}),
    AppCommonModule,
    TeleportModule,

    PlaylistModule,

    // Import global Angular Material Components
    MatIconModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatInputModule,
    MatListModule,
    MatDividerModule,
    MatProgressBarModule
  ],
  providers: [
    DeviceService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AccessTokenInterceptor,
      multi: true,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
 }
