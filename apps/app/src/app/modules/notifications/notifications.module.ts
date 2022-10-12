import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NotificationsComponent } from './views/notifications/notifications.component';
import { Error404Module } from 'src/app/shared/error404/error404.module';
import { SCNGXNotificationListItemModule, SCNGXToolbarModule } from 'soundcore-ngx';
import { SCDKNotificationModule } from '@soundcore/sdk';

const routes: Routes = [
  { path: "", component: NotificationsComponent }
]

@NgModule({
  declarations: [
    NotificationsComponent
  ],
  imports: [
    CommonModule,
    Error404Module,
    RouterModule.forChild(routes),

    SCNGXToolbarModule,

    SCDKNotificationModule,
    SCNGXNotificationListItemModule
  ]
})
export class NotificationsModule { }
