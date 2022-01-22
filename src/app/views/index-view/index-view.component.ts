import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/sso/authentication.service';

@Component({
  templateUrl: './index-view.component.html',
  styleUrls: ['./index-view.component.scss']
})
export class IndexViewComponent implements OnInit {

  constructor(public authService: AuthenticationService) { }

  ngOnInit(): void {
  }

}
