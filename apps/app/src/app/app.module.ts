import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SCCDKScreenModule } from '@repo/angular-cdk';
import { provideAuthentication } from '@repo/angular-oidc';
import { SCSDKModule, SCSDKMountModule } from '@repo/angular-sdk';
import { SCNGXDialogModule, SCNGXModule } from '@repo/angular-ui';
import { environment } from 'src/environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
    declarations: [
        AppComponent
    ],
    bootstrap: [AppComponent], imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
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
        SCSDKMountModule
    ],
    providers: [
        provideAuthentication({
            issuer: environment.oidc_issuer,
            clientId: environment.oidc_client_id,
            scope: environment.oidc_scope,
        }),
        provideHttpClient(withInterceptorsFromDi()),
    ]
})
export class AppModule { }
