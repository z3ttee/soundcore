import { Component, Input, OnInit } from '@angular/core';
import { Album, Artist, Playlist } from '@repo/angular-sdk';

@Component({
    selector: 'app-generic-resource-list-item',
    templateUrl: './generic-resource-list-item.component.html',
    styleUrls: ['./generic-resource-list-item.component.scss'],
    standalone: false
})
export class GenericResourceListItemComponent implements OnInit {

  @Input() public resource: Album | Playlist | Artist;

  constructor() { }

  public ngOnInit(): void { }

}
