import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsIndexComponent } from './views/settings-index/settings-index.component';
import { RouterModule, Routes } from '@angular/router';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

const routes: Routes = [
  { path: "", component: SettingsIndexComponent }
]

@NgModule({
  declarations: [
    SettingsIndexComponent
  ],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterModule.forChild(routes),

    MatCheckboxModule,
    MatButtonModule
  ]
})
export class SettingsModule { }
