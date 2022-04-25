import { Component, OnInit } from '@angular/core';
import { SCDKNotificationService } from 'soundcore-sdk';

@Component({
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {

  constructor(
    public readonly notificationService: SCDKNotificationService
  ) { }

  public ngOnInit(): void {
    this.notificationService.findByCurrentUser({ page: 0, size: 30 }).subscribe((page) => {
      console.log(page)
    })
  }

}
