import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChartPie } from '@ng-icons/heroicons/outline';
import { Zone } from "@repo/angular-sdk";
import { SCSkeleton } from '@repo/angular-ui';
import { BytesToUnitPipe } from '../../pipes/zoneBytes.pipe';

@Component({
  selector: 'zone-list-item',
  templateUrl: './zone-list-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, NgClass, SCSkeleton, BytesToUnitPipe],
  providers: [
    provideIcons({
      heroChartPie
    })
  ]
})
export class ZoneListItemComponent {
  public readonly zone = input.required<Zone>();
}
