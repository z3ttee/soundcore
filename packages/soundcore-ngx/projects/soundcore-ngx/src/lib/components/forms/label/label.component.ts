import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'scngx-label',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SCNGXLabelComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
