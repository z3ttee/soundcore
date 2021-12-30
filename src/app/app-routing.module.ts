import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexViewComponent } from './views/index-view/index-view.component';
import { SplashComponent } from './views/splash/splash.component';

const routes: Routes = [
  { path: "", component: IndexViewComponent, children: [
    { path: "artists", component: IndexViewComponent },
  ]},

  { path: "releases", loadChildren: () => import("./features/releases/releases.module").then((m) => m.ReleasesModule) },

  { path: "authorize", component: SplashComponent },

  // Make every route below to AsyncModule
  { path: "activity", component: IndexViewComponent },
  { path: "collection", component: IndexViewComponent },
  { path: "playlist/:playlistId", component: IndexViewComponent },

  { path: "library", loadChildren: () => import("./features/library/library.module").then((m) => m.LibraryModule) },
  { path: "storage", loadChildren: () => import("./features/storage/storage.module").then((m) => m.StorageModule) },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
