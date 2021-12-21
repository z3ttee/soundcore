import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexViewComponent } from './views/index-view/index-view.component';
import { SplashComponent } from './views/splash/splash.component';

const routes: Routes = [
  { path: "", component: IndexViewComponent },
  { path: "authorize", component: SplashComponent },

  // Make every route below to AsyncModule
  { path: "activity", component: IndexViewComponent },
  { path: "artists", component: IndexViewComponent },
  { path: "collection", component: IndexViewComponent },
  { path: "playlist/:playlistId", component: IndexViewComponent },

  { path: "library", loadChildren: () => import("./features/library/library.module").then((m) => m.LibraryModule) },
  { path: "genres", loadChildren: () => import("./features/genre/genre.module").then((m) => m.GenreModule) },
  { path: "releases", loadChildren: () => import("./features/releases/releases.module").then((m) => m.ReleasesModule) },
  { path: "admin", loadChildren: () => import("./features/admin/admin.module").then((m) => m.AdminModule) },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
