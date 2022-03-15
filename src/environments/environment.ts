// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  sso_base_uri: "https://api.tsalliance.eu/sso",
  sso_client_id: "2VYhnrdDzaEJlEyQ",
  sso_redirect_uri: "http://localhost:4200/authorize",
  // api_base_uri: "https://api.tsalliance.eu/soundcore",
  api_base_uri: "http://localhost:3001",

  keycloak_auth_server_url: "http://localhost:8888/auth",
  keycloak_realm: "master",
  keycloak_client_id: "alliance-soundcore-app",
  keycloak_account_console_url: "http://localhost:8888/auth/realms/master/account/"
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
