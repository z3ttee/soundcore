import { Component, OnInit } from '@angular/core';
import { Pageable, SCDKNotificationService } from 'soundcore-sdk';

@Component({
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {

  constructor(
    public readonly notificationService: SCDKNotificationService
  ) { }

  public ngOnInit(): void {
    this.notificationService.findByCurrentUser(new Pageable(0, 30)).subscribe((page) => {
      console.log(page)
    })
  }

}
