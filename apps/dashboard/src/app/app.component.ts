import { ScAvatar, ScDrawerModule } from '@/lib/components';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { provideIcons } from "@ng-icons/core";
import { phosphorComputerTowerDuotone, phosphorCpuDuotone, phosphorDesktopDuotone } from "@ng-icons/phosphor-icons/duotone";
import { DrawerNavItemComponent } from './components/drawer-nav-item/drawer-nav-item.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ScDrawerModule, ScAvatar, DrawerNavItemComponent],
  templateUrl: './app.component.html',
  providers: [
    provideIcons({
      phosphorDesktopDuotone,
      phosphorCpuDuotone,
      phosphorComputerTowerDuotone
    })
  ]
})
export class AppComponent {
}
