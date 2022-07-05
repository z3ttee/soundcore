import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'scngx-backdrop',
  templateUrl: './backdrop.component.html',
  styleUrls: ['./backdrop.component.scss']
})
export class BackdropComponent implements OnInit, OnDestroy {

  constructor() { }

  ngOnInit(): void {
  }
  ngOnDestroy(): void {
      console.log("destroyed test dialog")
  }

}
