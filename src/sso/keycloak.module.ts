import { APP_INITIALIZER, NgModule } from "@angular/core";
import { environment } from "src/environments/environment";
import { AllianceAuthModule } from "src/lib/authentication/authentication.module";

/*function initializeKeycloak(keycloak: KeycloakService) {
    return () =>
      keycloak.init({
        config: {
          url: environment.keycloak_auth_server_url,
          realm: environment.keycloak_realm,
          clientId: environment.keycloak_client_id
        },
        loadUserProfileAtStartUp: true,
        initOptions: {
          
          checkLoginIframe: false,
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html'
        }
      });
  }*/

@NgModule({
    imports: [
      AllianceAuthModule.forRoot({
          clientId: "alliance-soundcore-app",
          realm: "tsalliance",
          url: "https://sso.tsalliance.eu"
      })
        /*AllianceAuthModule.forRoot({
          clientId: "alliance-soundcore-app",
          realm: "tsalliance"
        })*/
    ],
    providers: [
        
    ]
})
export class KeycloakModule {}