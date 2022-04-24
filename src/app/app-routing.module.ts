import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from 'src/layouts/admin-layout/admin-layout.component';
import { AdminLayoutModule } from 'src/layouts/admin-layout/admin-layout.module';
import { AscMainLayoutComponent } from 'src/layouts/main-layout/main-layout.component';
import { AscMainLayoutModule } from 'src/layouts/main-layout/main-layout.module';
import { KeycloakSSOGuard } from 'src/sso/guards/keycloak.guard';
import { Error404Component } from './shared/error404/error404.component';
import { Error404Module } from './shared/error404/error404.module';

const routes: Routes = [
  { path: "admin", component: AdminLayoutComponent, canActivate: [ KeycloakSSOGuard ], children: [
    { path: "**", component: Error404Component }
  ]},
  { path: "", component: AscMainLayoutComponent, canActivate: [KeycloakSSOGuard], children: [
    { path: "", canActivate: [KeycloakSSOGuard], loadChildren: () => import("./modules/home/home.module").then((m) => m.HomeModule) },
    { path: "playlist", canActivate: [KeycloakSSOGuard], loadChildren: () => import("./modules/playlist/playlist.module").then((m) => m.PlaylistModule) },
    { path: "library", canActivate: [KeycloakSSOGuard], loadChildren: () => import("./modules/library/library.module").then((m) => m.LibraryModule) },
    { path: "collection", canActivate: [KeycloakSSOGuard], loadChildren: () => import("./modules/collection/collection.module").then((m) => m.CollectionModule) },
    { path: "profile", canActivate: [KeycloakSSOGuard], loadChildren: () => import("./modules/settings/settings.module").then((m) => m.SettingsModule) },
    { path: "settings", canActivate: [KeycloakSSOGuard], loadChildren: () => import("./modules/settings/settings.module").then((m) => m.SettingsModule) },
    { path: "search", canActivate: [KeycloakSSOGuard], loadChildren: () => import("./modules/search/search.module").then((m) => m.SearchModule) },
    { path: "notifications", canActivate: [KeycloakSSOGuard], loadChildren: () => import("./modules/notifications/notifications.module").then((m) => m.NotificationsModule) },
    { path: "**", component: Error404Component }
  ]},
  { path: "**", redirectTo: "/" }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    AscMainLayoutModule,
    AdminLayoutModule,
    Error404Module
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
