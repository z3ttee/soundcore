import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AuthenticationCanActivateGuard } from './sso/guards/can-activate.guard';
import { AuthorizeViewComponent } from './views/authorize-view/authorize-view.component';
import { IndexViewComponent } from './views/index-view/index-view.component';

const routes: Routes = [
  
  { path: "", component: MainLayoutComponent, children: [
    { path: "", canActivate: [AuthenticationCanActivateGuard], component: IndexViewComponent },
    { path: "artists", canActivate: [AuthenticationCanActivateGuard], component: IndexViewComponent },
    
    { path: "releases", canActivate: [AuthenticationCanActivateGuard], loadChildren: () => import("./features/releases/releases.module").then((m) => m.ReleasesModule) },
    { path: "search", canActivate: [AuthenticationCanActivateGuard], loadChildren: () => import("./features/search/search.module").then((m) => m.SearchModule) },
    { path: "library", canActivate: [AuthenticationCanActivateGuard], loadChildren: () => import("./features/library/library.module").then((m) => m.LibraryModule) },
    { path: "upload", canActivate: [AuthenticationCanActivateGuard], loadChildren: () => import("./features/upload/upload.module").then((m) => m.UploadModule) },
    { path: "storage", canActivate: [AuthenticationCanActivateGuard], loadChildren: () => import("./features/storage/storage.module").then((m) => m.StorageModule) },
    { path: "genres", canActivate: [AuthenticationCanActivateGuard], loadChildren: () => import("./features/genre/genre.module").then((m) => m.GenreModule) },
    { path: "playlists", canActivate: [AuthenticationCanActivateGuard], loadChildren: () => import("./features/playlist/playlist.module").then((m) => m.PlaylistModule) },
    { path: "artists", canActivate: [AuthenticationCanActivateGuard], loadChildren: () => import("./features/artist/artist.module").then((m) => m.ArtistModule) },
    { path: "import", canActivate: [AuthenticationCanActivateGuard], loadChildren: () => import("./features/import/import.module").then((m) => m.ImportModule) },

    // Make every route below to AsyncModule
    { path: "activity", canActivate: [AuthenticationCanActivateGuard], component: IndexViewComponent },
    { path: "collection", canActivate: [AuthenticationCanActivateGuard], component: IndexViewComponent },
  ]},

  { path: "authorize", canActivate: [AuthenticationCanActivateGuard], component: AuthorizeViewComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
