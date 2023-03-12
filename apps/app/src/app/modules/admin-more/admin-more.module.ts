import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AdminMoreComponent } from './views/admin-more/admin-more.component';
import { SCNGXButtonModule, SCNGXUiTitleModule } from '@soundcore/ngx';
import { NgIconsModule } from '@ng-icons/core';
import { heroCog6Tooth, heroArrowRightOnRectangle } from '@ng-icons/heroicons/outline';

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
    NgIconsModule.withIcons({ heroCog6Tooth, heroArrowRightOnRectangle }),

    SCNGXButtonModule,
    SCNGXUiTitleModule
  ]
})
export class AdminMoreModule { }
