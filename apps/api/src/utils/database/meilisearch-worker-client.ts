import MeiliSearch from "meilisearch";

class MeilisearchImpl {
    private static instance: MeilisearchImpl;
    private _client: MeiliSearch;

    constructor() {
        if(!MeilisearchImpl.instance) {
            MeilisearchImpl.instance = this;
        }

        return MeilisearchImpl.instance;
    }

    public async connect(): Promise<MeiliSearch> {
        if(!this._client) {
            this._client = new MeiliSearch({
                host: `${process.env.MEILISEARCH_HOST}:${process.env.MEILISEARCH_PORT}`,
                headers: {
                    "Authorization": `Bearer ${process.env.MEILISEARCH_KEY}`
                }
            })
        }

        return this._client;
    }

}


const Meilisearch = new MeilisearchImpl();
export default Meilisearch;