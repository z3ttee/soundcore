import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SongModule } from './features/song/song.module';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AuthenticationCanActivateGuard } from './sso/guards/can-activate.guard';
import { IndexViewComponent } from './views/index-view/index-view.component';

const routes: Routes = [
  
  { path: "", component: MainLayoutComponent, children: [
    { path: "", canActivate: [AuthenticationCanActivateGuard], component: IndexViewComponent },
    { path: "artist", canActivate: [AuthenticationCanActivateGuard], component: IndexViewComponent },
    
    { path: "releases", canActivate: [AuthenticationCanActivateGuard], loadChildren: () => import("./features/releases/releases.module").then((m) => m.ReleasesModule) },
    { path: "search", canActivate: [AuthenticationCanActivateGuard], loadChildren: () => import("./features/search/search.module").then((m) => m.SearchModule) },
    { path: "library", canActivate: [AuthenticationCanActivateGuard], loadChildren: () => import("./features/library/library.module").then((m) => m.LibraryModule) },
    { path: "upload", canActivate: [AuthenticationCanActivateGuard], loadChildren: () => import("./features/upload/upload.module").then((m) => m.UploadModule) },
    { path: "storage", canActivate: [AuthenticationCanActivateGuard], loadChildren: () => import("./features/storage/storage.module").then((m) => m.StorageModule) },
    { path: "genre", canActivate: [AuthenticationCanActivateGuard], loadChildren: () => import("./features/genre/genre.module").then((m) => m.GenreModule) },
    { path: "playlist", canActivate: [AuthenticationCanActivateGuard], loadChildren: () => import("./features/playlist/playlist.module").then((m) => m.PlaylistModule) },
    { path: "artist", canActivate: [AuthenticationCanActivateGuard], loadChildren: () => import("./features/artist/artist.module").then((m) => m.ArtistModule) },
    { path: "import", canActivate: [AuthenticationCanActivateGuard], loadChildren: () => import("./features/import/import.module").then((m) => m.ImportModule) },
    { path: "album", canActivate: [AuthenticationCanActivateGuard], loadChildren: () => import("./features/album/album.module").then((m) => m.AlbumModule) },
    { path: "collection", canActivate: [AuthenticationCanActivateGuard], loadChildren: () => import("./features/collection/collection.module").then((m) => m.CollectionModule) },
    { path: "song", canActivate: [AuthenticationCanActivateGuard], loadChildren: () => import("./features/song/song.module").then((m) => m.SongModule) },

    { path: "profile", canActivate: [AuthenticationCanActivateGuard], loadChildren: () => import("./features/user/user.module").then((m) => m.UserModule) },

    // Make every route below to AsyncModule
    { path: "activity", canActivate: [AuthenticationCanActivateGuard], component: IndexViewComponent },
  ]},

  { path: "player", canActivate: [AuthenticationCanActivateGuard], loadChildren: () => import("./features/player/player.module").then((m) => m.PlayerModule) },

  { path: "**", canActivate: [AuthenticationCanActivateGuard], component: IndexViewComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
