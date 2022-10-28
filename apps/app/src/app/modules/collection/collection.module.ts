import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollectionComponent } from './views/collection/collection.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: "", component: CollectionComponent }
]

@NgModule({
  declarations: [
    CollectionComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class CollectionModule { }
