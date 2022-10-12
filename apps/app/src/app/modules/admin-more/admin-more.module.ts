import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AdminMoreComponent } from './views/admin-more/admin-more.component';
import { HeroIconModule, cog, logout } from 'ng-heroicon';
import { SCNGXButtonModule, SCNGXUiTitleModule } from '@soundcore/ngx';

const routes: Routes = [
  { path: "", component: AdminMoreComponent }
]

@NgModule({
  declarations: [
    AdminMoreComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    HeroIconModule.withIcons({ cog, logout }),

    SCNGXButtonModule,
    SCNGXUiTitleModule
  ]
})
export class AdminMoreModule { }
