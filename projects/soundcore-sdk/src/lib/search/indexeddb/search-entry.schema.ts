import { ObjectStoreMeta } from 'ngx-indexed-db';
import { SC_SEARCHHISTORY_STORE } from '../../constants';

export const SearchEntrySchema = {
    store: SC_SEARCHHISTORY_STORE,
    storeConfig: {
        keyPath: "id",
        autoIncrement: false
    },
    storeSchema: [
        { name: "id", keypath: "id" },
        { name: "artwork", keypath: "artwork" },
        { name: "slug", keypath: "slug" },
        { name: "name", keypath: "name" },
    ]
} as ObjectStoreMeta;