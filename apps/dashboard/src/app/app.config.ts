import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAuthentication } from '@repo/angular-oidc';

import { provideNgIconsConfig } from '@ng-icons/core';
import { routes } from './routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAuthentication({
      clientId: "alliance-soundcore-app",
      issuer: "https://sso.zitzmann.dev/realms/tsalliance",
      scope: "profile email offline_access",
    }),
    provideNgIconsConfig({
      size: "20px",
    })
  ]
};
