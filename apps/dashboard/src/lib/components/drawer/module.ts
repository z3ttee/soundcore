import { NgModule } from "@angular/core";
import { ScDrawerContentComponent } from "./components/drawer-content/drawer-content.component";
import { ScDrawerFooterComponent } from "./components/drawer-footer/drawer-footer.component";
import { ScDrawerSidebarComponent } from "./components/drawer-sidebar/drawer-sidebar.component";
import { ScDrawerComponent } from "./components/drawer/drawer.component";

@NgModule({
    imports: [ScDrawerComponent, ScDrawerSidebarComponent, ScDrawerFooterComponent, ScDrawerContentComponent],
    exports: [ScDrawerComponent, ScDrawerSidebarComponent, ScDrawerFooterComponent, ScDrawerContentComponent],
})
export class ScDrawerModule { }