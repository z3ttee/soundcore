import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Notification } from '@soundcore/sdk';

@Component({
  selector: 'scngx-notification-list-item',
  templateUrl: './notification-list-item.component.html',
  styleUrls: ['./notification-list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SCNGXNotificationListItemComponent implements OnInit {

  @Input() public notification: Notification;

  constructor() { }

  ngOnInit(): void {
  }

}
