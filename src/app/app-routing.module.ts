import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllianceAuthGuard } from 'src/lib/authentication/guard/authentication.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { IndexViewComponent } from './views/index-view/index-view.component';

const routes: Routes = [
  
  { path: "", component: MainLayoutComponent, children: [
    { path: "", canActivate: [AllianceAuthGuard], component: IndexViewComponent },
    { path: "artist", canActivate: [], component: IndexViewComponent },
    
    { path: "releases", canActivate: [], loadChildren: () => import("./features/releases/releases.module").then((m) => m.ReleasesModule) },
    { path: "search", canActivate: [], loadChildren: () => import("./features/search/search.module").then((m) => m.SearchModule) },
    { path: "library", canActivate: [], loadChildren: () => import("./features/library/library.module").then((m) => m.LibraryModule) },
    { path: "upload", canActivate: [], loadChildren: () => import("./features/upload/upload.module").then((m) => m.UploadModule) },
    { path: "storage", canActivate: [], loadChildren: () => import("./features/storage/storage.module").then((m) => m.StorageModule) },
    { path: "genre", canActivate: [], loadChildren: () => import("./features/genre/genre.module").then((m) => m.GenreModule) },
    { path: "playlist", canActivate: [], loadChildren: () => import("./features/playlist/playlist.module").then((m) => m.PlaylistModule) },
    { path: "artist", canActivate: [], loadChildren: () => import("./features/artist/artist.module").then((m) => m.ArtistModule) },
    { path: "import", canActivate: [], loadChildren: () => import("./features/import/import.module").then((m) => m.ImportModule) },
    { path: "album", canActivate: [], loadChildren: () => import("./features/album/album.module").then((m) => m.AlbumModule) },
    { path: "collection", canActivate: [], loadChildren: () => import("./features/collection/collection.module").then((m) => m.CollectionModule) },
    { path: "song", canActivate: [], loadChildren: () => import("./features/song/song.module").then((m) => m.SongModule) },
    { path: "settings", canActivate: [], loadChildren: () => import("./features/settings/settings.module").then((m) => m.SettingsModule) },

    { path: "profile", canActivate: [], loadChildren: () => import("./features/user/user.module").then((m) => m.UserModule) },

    // Make every route below to AsyncModule
    { path: "activity", canActivate: [], component: IndexViewComponent },
  ]},

  { path: "player", canActivate: [], loadChildren: () => import("./features/player/player.module").then((m) => m.PlayerModule) },

  { path: "**", canActivate: [], component: IndexViewComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
