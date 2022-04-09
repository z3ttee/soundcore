import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthModule } from 'src/sso/auth.module';
import { SCNGXModule } from 'projects/soundcore-ngx/src/lib/scngx.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,

    AuthModule,
    SCNGXModule.register({
      screen: {
        screens: [
          { name: "sm", width: 540 },
          { name: "md", width: 780 },
          { name: "lg", width: 1000 },
          { name: "xl", width: 1200 },
          { name: "2xl", width: 1550 }
        ]
      }
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
