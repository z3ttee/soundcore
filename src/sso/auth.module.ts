import { APP_INITIALIZER, NgModule } from "@angular/core";
import { KeycloakAngularModule, KeycloakService } from "keycloak-angular";
import { environment } from "src/environments/environment";

function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
      config: {
        url: environment.keycloak_url,
        realm: environment.keycloak_realm,
        clientId: environment.keycloak_client_id
      },
      loadUserProfileAtStartUp: true,
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html'
      }
    });
}

@NgModule({
    imports: [
      KeycloakAngularModule
    ],
    providers: [
      {
        provide: APP_INITIALIZER,
        useFactory: initializeKeycloak,
        multi: true,
        deps: [KeycloakService]
      }
    ]
})
export class AuthModule {}