import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SSOGuard } from '@soundcore/sso';
import { AdminLayoutComponent } from 'src/app/layouts/admin-layout/admin-layout.component';
import { AdminLayoutModule } from 'src/app/layouts/admin-layout/admin-layout.module';
import { AscMainLayoutComponent } from 'src/app/layouts/main-layout/main-layout.component';
import { AscMainLayoutModule } from 'src/app/layouts/main-layout/main-layout.module';
import { Error404Component } from './shared/error404/error404.component';
import { Error404Module } from './shared/error404/error404.module';

const routes: Routes = [
  { path: "admin", component: AdminLayoutComponent, canActivate: [ SSOGuard ], data: { roles: ["admin"] }, children: [
    { path: "", redirectTo: "/admin/zones", pathMatch: "full" },
    { path: "zones", canActivate: [SSOGuard], loadChildren: () => import("./modules/zones/zones.module").then((m) => m.ZonesModule) },
    { path: "more", canActivate: [SSOGuard], loadChildren: () => import("./modules/admin-more/admin-more.module").then((m) => m.AdminMoreModule) },
    { path: "**", redirectTo: "/admin/zones", pathMatch: "full" }
  ]},
  { path: "", component: AscMainLayoutComponent, canActivate: [SSOGuard], children: [
    { path: "", canActivate: [SSOGuard], loadChildren: () => import("./modules/home/home.module").then((m) => m.HomeModule) },
    { path: "album", canActivate: [SSOGuard], loadChildren: () => import("./modules/album/album.module").then((m) => m.AlbumModule) },
    { path: "artist", canActivate: [SSOGuard], loadChildren: () => import("./modules/artist/artist.module").then((m) => m.ArtistModule) },
    { path: "playlist", canActivate: [SSOGuard], loadChildren: () => import("./modules/playlist/playlist.module").then((m) => m.PlaylistModule) },
    { path: "library", canActivate: [SSOGuard], loadChildren: () => import("./modules/library/library.module").then((m) => m.LibraryModule) },
    { path: "collection", canActivate: [SSOGuard], loadChildren: () => import("./modules/collection/collection.module").then((m) => m.CollectionModule) },
    { path: "profile", canActivate: [SSOGuard], loadChildren: () => import("./modules/profile/profile.module").then((m) => m.ProfileModule) },
    { path: "settings", canActivate: [SSOGuard], loadChildren: () => import("./modules/settings/settings.module").then((m) => m.SettingsModule) },
    { path: "search", canActivate: [SSOGuard], loadChildren: () => import("./modules/search/search.module").then((m) => m.SearchModule) },
    { path: "notifications", canActivate: [SSOGuard], loadChildren: () => import("./modules/notifications/notifications.module").then((m) => m.NotificationsModule) },
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
