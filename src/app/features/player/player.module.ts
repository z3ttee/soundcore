import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerComponent } from './views/player/player.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: "", component: PlayerComponent }
]

@NgModule({
  declarations: [
    PlayerComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class PlayerModule { }
