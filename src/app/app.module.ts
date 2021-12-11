import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IndexViewComponent } from './views/index-view/index-view.component';
import { DrawerComponent } from './components/drawer/drawer.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SidebarComponent } from './views/shared/sidebar/sidebar.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { SplashComponent } from './views/splash/splash.component';
import { StoreModule } from '@ngrx/store';

import { HttpClientModule } from "@angular/common/http"
import { AuthenticationService } from './services/authentication.service';

// TODO: https://angular.io/guide/i18n-common-prepare

@NgModule({
  declarations: [
    AppComponent,
    IndexViewComponent,
    DrawerComponent,
    SidebarComponent,
    ToolbarComponent,
    SplashComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    StoreModule.forRoot({}, {})
  ],
  providers: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
 }
