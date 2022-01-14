import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SongGridItemComponent } from '../../components/grid-items/song-grid-item/song-grid-item.component';
import { RouterModule, Routes } from '@angular/router';
import { PipesModule } from 'src/app/pipes/pipes.module';

const routes: Routes = [

]

@NgModule({
  declarations: [
    SongGridItemComponent
  ],
  imports: [
    CommonModule,
    PipesModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    SongGridItemComponent,
  ]
})
export class SongModule { }
