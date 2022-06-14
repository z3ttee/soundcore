import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Mount } from "soundcore-sdk";

@Component({
  selector: 'app-mount-list-item',
  templateUrl: './mount-list-item.component.html',
  styleUrls: ['./mount-list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MountListItemComponent implements OnInit {

  @Input() public mount: Mount;

  constructor() { }

  public ngOnInit(): void {}

}
