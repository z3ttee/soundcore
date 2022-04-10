import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-playlist-info',
  templateUrl: './playlist-info.component.html',
  styleUrls: ['./playlist-info.component.scss']
})
export class PlaylistInfoComponent implements OnInit {


  public showError404: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

}
