import { NgModule } from "@angular/core";
import { ScBaseButtonComponent } from "./base-button/base-button.component";
import { ScButtonComponent } from "./default-button/button.component";
import { ScIconButtonComponent } from "./icon-button/icon-button.component";

@NgModule({
  imports: [ScButtonComponent, ScIconButtonComponent, ScBaseButtonComponent],
  exports: [ScButtonComponent, ScIconButtonComponent, ScBaseButtonComponent]
})
export class ScButtonModule { }
