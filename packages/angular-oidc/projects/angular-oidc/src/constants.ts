import { InjectionToken } from "@angular/core";
import { AuthenticationModuleOptions } from "./types";

export const DI_AUTH_OPTIONS = new InjectionToken<AuthenticationModuleOptions>("DI_AUTH_OPTIONS");

export const KEY_COOKIE_ACCESSTOKEN = "access_token";
export const KEY_COOKIE_REFRESHTOKEN = "refresh_token";
export const KEY_COOKIE_IDTOKEN = "id_token";
export const KEY_COOKIE_EXPIRESAT = "expires_at";
