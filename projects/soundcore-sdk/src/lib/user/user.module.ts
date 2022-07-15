import { NgModule } from "@angular/core";
import { SCDKUserService } from "./services/user.service";

@NgModule({
    providers: [
        SCDKUserService
    ]
})
export class SCDKUserModule {}