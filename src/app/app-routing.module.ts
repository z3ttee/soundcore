import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexViewComponent } from './views/index-view/index-view.component';

const routes: Routes = [
  { path: "", component: IndexViewComponent },
  { path: "library", component: IndexViewComponent },
  { path: "activity", component: IndexViewComponent },
  { path: "releases", component: IndexViewComponent },
  { path: "genres", component: IndexViewComponent },
  { path: "artists", component: IndexViewComponent },
  { path: "collection", component: IndexViewComponent },
  { path: "playlist/:playlistId", component: IndexViewComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
