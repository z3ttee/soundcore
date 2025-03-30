import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from 'src/app/layouts/admin-layout/admin-layout.component';
import { AdminLayoutModule } from 'src/app/layouts/admin-layout/admin-layout.module';
import { AscMainLayoutComponent } from 'src/app/layouts/main-layout/main-layout.component';
import { AscMainLayoutModule } from 'src/app/layouts/main-layout/main-layout.module';
import { Error404Component } from './shared/error404/error404.component';
import { Error404Module } from './shared/error404/error404.module';

const routes: Routes = [
  {
    path: "admin", component: AdminLayoutComponent, canActivate: [], data: { roles: ["admin"] }, children: [
      { path: "", canActivate: [], loadChildren: () => import("./modules/dashboard/dashboard.module").then((m) => m.DashboardModule) },
      { path: "zones", canActivate: [], loadChildren: () => import("./modules/zones/zones.module").then((m) => m.ZonesModule) },
      { path: "import", canActivate: [], loadChildren: () => import("./modules/import/import.module").then((m) => m.ImportModule) },
      { path: "tasks", canActivate: [], loadChildren: () => import("./modules/tasks/tasks.module").then((m) => m.TasksModule) },
      { path: "configurate", canActivate: [], loadChildren: () => import("./modules/configurate/configurate.module").then((m) => m.ConfigurateModule) },
      { path: "more", canActivate: [], loadChildren: () => import("./modules/admin-more/admin-more.module").then((m) => m.AdminMoreModule) },
      { path: "**", redirectTo: "/admin/zones", pathMatch: "full" }
    ]
  },
  { path: "bigpicture", canActivate: [], loadChildren: () => import("./modules/bigpicture/bigpicture.module").then((m) => m.BigPictureModule) },
  {
    path: "", component: AscMainLayoutComponent, canActivate: [], children: [
      { path: "", canActivate: [], loadChildren: () => import("./modules/home/home.module").then((m) => m.HomeModule) },
      { path: "album", canActivate: [], loadChildren: () => import("./modules/album/album.module").then((m) => m.AlbumModule) },
      { path: "player", canActivate: [], loadChildren: () => import("./modules/player/player.module").then((m) => m.AppPlayerModule) },
      { path: "artist", canActivate: [], loadChildren: () => import("./modules/artist/artist.module").then((m) => m.ArtistModule) },
      { path: "playlist", canActivate: [], loadChildren: () => import("./modules/playlist/playlist.module").then((m) => m.PlaylistModule) },
      { path: "song", canActivate: [], loadChildren: () => import("./modules/songs/song.module").then((m) => m.SongModule) },
      { path: "library", canActivate: [], loadChildren: () => import("./modules/library/library.module").then((m) => m.LibraryModule) },
      { path: "collection", canActivate: [], loadChildren: () => import("./modules/collection/collection.module").then((m) => m.CollectionModule) },
      { path: "profile", canActivate: [], loadChildren: () => import("./modules/profile/profile.module").then((m) => m.ProfileModule) },
      { path: "settings", canActivate: [], loadChildren: () => import("./modules/settings/settings.module").then((m) => m.SettingsModule) },
      { path: "search", canActivate: [], loadChildren: () => import("./modules/search/search.module").then((m) => m.SearchModule) },
      { path: "notifications", canActivate: [], loadChildren: () => import("./modules/notifications/notifications.module").then((m) => m.NotificationsModule) },
      { path: "**", component: Error404Component }
    ]
  },
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
