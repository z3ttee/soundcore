import { NgModule } from "@angular/core";
import { SCNGXScreenService } from "./screen.service";

export interface SCNGXScreen {
    name: string,
    width: number;
    height: number;
    isTouch: boolean;
}

@NgModule({
    providers: [
        SCNGXScreenService
    ]
})
export class SCNGXScreenModule {}