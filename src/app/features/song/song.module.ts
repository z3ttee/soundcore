import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PipesModule } from 'src/app/pipes/pipes.module';

const routes: Routes = [
  
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    PipesModule,
    RouterModule.forChild(routes)
  ]
})
export class SongModule { }
