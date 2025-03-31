import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'scngx-skeleton',
  templateUrl: './skeleton.component.html',
  styleUrls: ['./skeleton.component.scss']
})
export class SCNGXSkeletonComponent implements OnInit {

  @Input() public class: string;

  constructor() { }

  ngOnInit(): void {
  }

}
