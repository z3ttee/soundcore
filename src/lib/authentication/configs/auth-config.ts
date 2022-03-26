import Keycloak from "keycloak-js";

export interface AllianceAuthConfig {

    config: Keycloak.KeycloakConfig;
    init: Keycloak.KeycloakInitOptions;

    login?: Keycloak.KeycloakLoginOptions;
    logout?: Keycloak.KeycloakLogoutOptions;

    interceptor?: AllianceAuthInterceptorConfig;
}

export interface AllianceAuthInterceptorConfig {

    disabled?: boolean;

}