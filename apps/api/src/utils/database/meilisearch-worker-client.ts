import { MeiliClient } from "@soundcore/meilisearch";
import { IndexSchema } from "@soundcore/meilisearch/dist/definitions";
import MeiliSearch from "meilisearch";

class MeilisearchImpl {
    private static instance: MeilisearchImpl;
    private _client: MeiliClient;

    constructor() {
        if(!MeilisearchImpl.instance) {
            MeilisearchImpl.instance = this;
        }

        return MeilisearchImpl.instance;
    }

    public async connect(schemas?: IndexSchema[]): Promise<MeiliSearch> {
        if(!this._client) {
            this._client = new MeiliClient({
                host: `${process.env.MEILISEARCH_HOST}:${process.env.MEILISEARCH_PORT}`,
                headers: {
                    "Authorization": `Bearer ${process.env.MEILISEARCH_KEY}`
                }
            }, schemas ?? []);
        }

        return this._client;
    }

}


const MeilisearchClient = new MeilisearchImpl();
export default MeilisearchClient;