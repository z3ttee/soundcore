import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SCSDKModule, SCSDKMountModule } from '@soundcore/sdk';
import { environment } from 'src/environments/environment';
import { SCNGXModule, SCNGXDialogModule } from '@soundcore/ngx';
import { SCCDKScreenModule } from '@soundcore/cdk';
import { HttpClientModule } from '@angular/common/http';
import { SSOModule } from "@soundcore/sso";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    SSOModule.forRoot({
      baseUrl: environment.keycloak_url,
      realm: environment.keycloak_realm,
      clientId: environment.keycloak_client_id,
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html'
      },
      loadUserProfileAtStartUp: true,
      roleMapping: {
        admin: environment.admin_role,
        mod: environment.mod_role
      }
    }),
    SCSDKModule.forRoot({
      api_base_uri: environment.api_base_uri
    }),
    SCNGXModule.register({
      cdk: {
        screen: {
          screens: [
            { name: "sm", width: 540 },
            { name: "md", width: 780 },
            { name: "lg", width: 1000 },
            { name: "xl", width: 1200 },
            { name: "2xl", width: 1550 }
          ]
        }
      }
    }),
    SCCDKScreenModule,
    SCNGXDialogModule,
    SCSDKMountModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
