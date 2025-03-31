import { Component, OnInit } from '@angular/core';
import { SCDKNotificationService } from '@repo/angular-sdk';
import { Pageable } from '@repo/utilities';

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
