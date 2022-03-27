import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QueueViewComponent } from './views/queue-view/queue-view.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: "", component: QueueViewComponent }
]

@NgModule({
  declarations: [
    QueueViewComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class QueueModule { }
