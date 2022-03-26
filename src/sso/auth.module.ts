import { NgModule } from "@angular/core";
import { environment } from "src/environments/environment";
import { AllianceAuthModule } from "src/lib/authentication/authentication.module";

@NgModule({
    imports: [
      AllianceAuthModule.forRoot({
        config: {
          clientId: environment.keycloak_client_id,
          realm: environment.keycloak_realm,
          url: environment.keycloak_url
        },
        init: {
          onLoad: "check-sso",
          silentCheckSsoRedirectUri: `${window.location.origin}/assets/silent-check-sso.html`
        },
        login: {
          redirectUri: window.location.origin
        },
        logout: {
          redirectUri: window.location.origin
        }
      })
    ]
})
export class AuthModule {}