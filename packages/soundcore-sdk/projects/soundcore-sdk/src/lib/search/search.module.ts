import { NgModule } from "@angular/core";
import { NgxIndexedDBModule } from 'ngx-indexed-db';
import { SOUNDCORE_INDEXEDDB_NAME } from "../constants";
import { SearchEntrySchema } from "./indexeddb/search-entry.schema";

@NgModule({
    imports: [
        NgxIndexedDBModule.forRoot({
            name: SOUNDCORE_INDEXEDDB_NAME,
            version: 1,
            objectStoresMeta: [
                SearchEntrySchema
            ]
        })
    ]
})
export class SCSDKSearchModule {}