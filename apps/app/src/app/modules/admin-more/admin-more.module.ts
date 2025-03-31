import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgIconsModule } from '@ng-icons/core';
import { heroArrowRightOnRectangle, heroCog6Tooth } from '@ng-icons/heroicons/outline';
import { SCNGXButtonModule, SCNGXUiTitleModule } from '@repo/angular-ui';
import { AdminMoreComponent } from './views/admin-more/admin-more.component';

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
