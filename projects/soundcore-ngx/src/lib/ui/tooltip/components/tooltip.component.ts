import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'scngx-tooltip',
  template: `
    <div class="p-2">
      <div role="tooltip" class="pointer-events-auto select-none rounded-sm p-2 text-sm bg-body-light shadow-md z-[10000]">
        {{ text }}
      </div>
    </div>
  `
})
export class SCNGXTooltipComponent implements OnInit {

  @Input() public text: string;

  constructor() { }

  ngOnInit(): void {
  }

}
