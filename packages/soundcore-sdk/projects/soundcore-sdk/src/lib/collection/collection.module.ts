import { NgModule } from "@angular/core";
import { SCSDKCollectionService } from "./services/collection.service";
import { SCSDKLibraryService } from "./services/library.service";

@NgModule({
    providers: [
        SCSDKCollectionService,
        SCSDKLibraryService
    ]
})
export class SCSDKCollectionModule {}