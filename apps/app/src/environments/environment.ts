// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  oidc_issuer: "https://sso.zitzmann.dev/realms/tsalliance",
  oidc_client_id: "alliance-soundcore-app",
  oidc_scope: "profile email offline_access",

  api_base_uri: "http://localhost:3002",
  keycloak_url: "https://sso.zitzmann.dev/",
  keycloak_realm: "tsalliance",
  keycloak_client_id: "alliance-soundcore-app",

  admin_role: "admin",
  mod_role: "mod"
};