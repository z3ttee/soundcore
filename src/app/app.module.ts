import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthModule } from 'src/sso/auth.module';
import { SCNGXModule } from 'projects/soundcore-ngx/src/lib/scngx.module';
import { SCDKModule } from 'soundcore-sdk';
import { environment } from 'src/environments/environment';
import { SCNGXDialogModule } from 'soundcore-ngx';
import { SCCDKScreenModule } from 'soundcore-cdk';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,

    AuthModule,
    SCNGXDialogModule,
    SCDKModule.forRoot({
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
    SCNGXDialogModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
