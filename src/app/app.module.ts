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
import { AccentradialComponent } from './views/shared/accentradial/accentradial.component';
import { AudioplayerModule } from './features/audioplayer/audioplayer.module';

import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatDividerModule} from '@angular/material/divider';
import { AppCommonModule } from './common.module';
import { StreamService } from './services/stream.service';
import { DeviceService } from './services/device.service';
import { AccessTokenInterceptor } from './interceptors/access-token.interceptor';

import { TeleportModule } from '@ngneat/overview';

// TODO: https://angular.io/guide/i18n-common-prepare

@NgModule({
  declarations: [
    AppComponent,
    IndexViewComponent,
    DrawerComponent,
    SidebarComponent,
    ToolbarComponent,
    SplashComponent,
    AccentradialComponent
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

    // Import global Angular Material Components
    MatIconModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatInputModule,
    MatListModule,
    MatDividerModule
  ],
  providers: [
    StreamService,
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
