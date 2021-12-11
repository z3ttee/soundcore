import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexViewComponent } from './views/index-view/index-view.component';
import { SplashComponent } from './views/splash/splash.component';

const routes: Routes = [
  { path: "", component: IndexViewComponent },
  { path: "authorize", component: SplashComponent },

  // Make every route below to AsyncModule
  { path: "library", component: IndexViewComponent },
  { path: "activity", component: IndexViewComponent },
  { path: "releases", component: IndexViewComponent },
  { path: "artists", component: IndexViewComponent },
  { path: "collection", component: IndexViewComponent },
  { path: "playlist/:playlistId", component: IndexViewComponent },

  { path: "genres", loadChildren: () => import("./features/genre/genre.module").then((m) => m.GenreModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
