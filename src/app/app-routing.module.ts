import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { environment } from 'src/environments/environment';
import { KeycloakSSOGuard } from 'src/sso/guards/keycloak.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { IndexViewComponent } from './views/index-view/index-view.component';

const routes: Routes = [
  
  { path: "", component: MainLayoutComponent, children: [
    { path: "", canActivate: [KeycloakSSOGuard], component: IndexViewComponent },
    { path: "artist", canActivate: [KeycloakSSOGuard], component: IndexViewComponent },
    
    { path: "releases", canActivate: [KeycloakSSOGuard], loadChildren: () => import("./features/releases/releases.module").then((m) => m.ReleasesModule) },
    { path: "search", canActivate: [KeycloakSSOGuard], loadChildren: () => import("./features/search/search.module").then((m) => m.SearchModule) },
    { path: "library", canActivate: [KeycloakSSOGuard], loadChildren: () => import("./features/library/library.module").then((m) => m.LibraryModule) },
    { path: "upload", canActivate: [KeycloakSSOGuard], loadChildren: () => import("./features/upload/upload.module").then((m) => m.UploadModule) },
    { path: "storage", canActivate: [KeycloakSSOGuard], loadChildren: () => import("./features/storage/storage.module").then((m) => m.StorageModule), data: { role: environment.admin_role } },
    { path: "genre", canActivate: [KeycloakSSOGuard], loadChildren: () => import("./features/genre/genre.module").then((m) => m.GenreModule) },
    { path: "playlist", canActivate: [KeycloakSSOGuard], loadChildren: () => import("./features/playlist/playlist.module").then((m) => m.PlaylistModule) },
    { path: "artist", canActivate: [KeycloakSSOGuard], loadChildren: () => import("./features/artist/artist.module").then((m) => m.ArtistModule) },
    { path: "import", canActivate: [KeycloakSSOGuard], loadChildren: () => import("./features/import/import.module").then((m) => m.ImportModule) },
    { path: "album", canActivate: [KeycloakSSOGuard], loadChildren: () => import("./features/album/album.module").then((m) => m.AlbumModule) },
    { path: "collection", canActivate: [KeycloakSSOGuard], loadChildren: () => import("./features/collection/collection.module").then((m) => m.CollectionModule) },
    { path: "song", canActivate: [KeycloakSSOGuard], loadChildren: () => import("./features/song/song.module").then((m) => m.SongModule) },
    { path: "settings", canActivate: [KeycloakSSOGuard], loadChildren: () => import("./features/settings/settings.module").then((m) => m.SettingsModule) },
    { path: "queue", canActivate: [KeycloakSSOGuard], loadChildren: () => import("./features/queue/queue.module").then((m) => m.QueueModule) },

    { path: "profile", canActivate: [KeycloakSSOGuard], loadChildren: () => import("./features/user/user.module").then((m) => m.UserModule) },

    // Make every route below to AsyncModule
    { path: "activity", canActivate: [KeycloakSSOGuard], component: IndexViewComponent },
  ]},

  { path: "player", canActivate: [KeycloakSSOGuard], loadChildren: () => import("./features/player/player.module").then((m) => m.PlayerModule) },

  { path: "**", canActivate: [KeycloakSSOGuard], component: IndexViewComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
