import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SCNGXNotificationListItemModule, SCNGXToolbarModule } from '@repo/angular-ui';
import { SCDKNotificationModule } from '@repo/angular-sdk';
import { Error404Module } from 'src/app/shared/error404/error404.module';
import { NotificationsComponent } from './views/notifications/notifications.component';

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
