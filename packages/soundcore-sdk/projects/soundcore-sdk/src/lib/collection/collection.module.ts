import { NgModule } from "@angular/core";
import { SCSDKCollectionService } from "./services/collection.service";
import { SCSDKLibraryService } from "./services/library.service";
import { SCSDKLikeService } from "./services/like.service";

@NgModule({
    providers: [
        SCSDKCollectionService,
        SCSDKLikeService,
        SCSDKLibraryService
    ]
})
export class SCSDKCollectionModule {}