import { APP_INITIALIZER, ModuleWithProviders, NgModule } from "@angular/core";
import { KeycloakAngularModule, KeycloakOptions, KeycloakService } from "keycloak-angular";
import { KeycloakInitOptions } from "keycloak-js";
import { Subject } from "rxjs";
import { SSOService } from "./services/sso.service";

const $keycloakInitializeError: Subject<Error> = new Subject();
function initializeKeycloak(keycloak: KeycloakService, options: SSOModuleOptionsImpl) {
  return () =>
    keycloak.init({
      config: {
        url: options.baseUrl,
        realm: options.realm,
        clientId: options.clientId
      },
      loadUserProfileAtStartUp: options.loadUserProfileAtStartUp,
      initOptions: options.initOptions
    }).catch((error: Error) => {
      $keycloakInitializeError.next(error);
    });
}

interface SSORoleMapping {
  /**
   * How is admin role identified (or called) in keycloak?
   */
  admin?: string;

  /**
   * How is mod role identified (or called) in keycloak?
   */
  mod?: string;
}

export const SSO_OPTIONS = "sso-module-options";
export interface SSOModuleOptions extends Pick<KeycloakOptions, "loadUserProfileAtStartUp">, Pick<KeycloakOptions, "initOptions"> {
  baseUrl: string;
  realm: string;
  clientId: string;
  roleMapping?: SSORoleMapping
}

export class SSOModuleOptionsImpl implements SSOModuleOptions {

  baseUrl: string;
  realm: string;
  clientId: string;
  loadUserProfileAtStartUp?: boolean | undefined;
  initOptions?: KeycloakInitOptions | undefined;
  roleMapping?: SSORoleMapping | undefined;

}

@NgModule({
    imports: [
      KeycloakAngularModule
    ]
})
export class SSOModule {

  public static forRoot(options: SSOModuleOptions): ModuleWithProviders<SSOModule> {
    return {
      ngModule: SSOModule,
      providers: [
        SSOService,
        {
          provide: SSOModuleOptionsImpl,
          useValue: options
        },
        {
          provide: "keycloakInitializeError",
          useValue: $keycloakInitializeError
        },
        {
          provide: APP_INITIALIZER,
          useFactory: initializeKeycloak,
          multi: true,
          deps: [KeycloakService, SSOModuleOptionsImpl]
        }
      ]
    }
  }

}