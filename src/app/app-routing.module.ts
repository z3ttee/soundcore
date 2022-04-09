import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AscMainLayoutComponent } from 'src/layouts/main-layout/main-layout.component';
import { AscMainLayoutModule } from 'src/layouts/main-layout/main-layout.module';
import { KeycloakSSOGuard } from 'src/sso/guards/keycloak.guard';

const routes: Routes = [
  { path: "", component: AscMainLayoutComponent, canActivate: [KeycloakSSOGuard], children: [
    { path: "", canActivate: [KeycloakSSOGuard], loadChildren: () => import("./modules/home/home.module").then((m) => m.HomeModule) },
    { path: "settings", canActivate: [KeycloakSSOGuard], loadChildren: () => import("./modules/settings/settings.module").then((m) => m.SettingsModule) },
  ]}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    AscMainLayoutModule
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
