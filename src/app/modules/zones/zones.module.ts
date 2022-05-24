import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ZonesIndexComponent } from './views/zones-index/zones-index.component';

const routes: Routes = [
  { path: "", component: ZonesIndexComponent }
]

@NgModule({
  declarations: [
    ZonesIndexComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class ZonesModule { }
