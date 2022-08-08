import MeiliSearch from "meilisearch";
import { DataSource } from "typeorm";
import { TYPEORM_ENTITY_GLOB } from "../../constants";
import { FileSystemService } from "../../filesystem/services/filesystem.service";

export class DBWorker {
    private static _instance: DBWorker;
    private _meili: MeiliSearch;
    private _fileSystem: FileSystemService = new FileSystemService();

    private readonly _datasource: DataSource = new DataSource({
        type: "mysql",
        port: parseInt(process.env.DB_PORT),
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASS,
        username: process.env.DB_USER,
        entityPrefix: process.env.DB_PREFIX || "sc_",
        entities: [
            TYPEORM_ENTITY_GLOB
        ]
    });

    constructor() {
        this.createMeiliInstance();
    }

    /**
     * Get a connection to the database via typeorm.
     * If the datasource was initialized previously, then
     * this datasource is returned, otherwise it will be
     * initialized and returned afterwards
     * @returns DataSource
     */
    public async establishConnection(): Promise<DataSource> {
        if(this._datasource.isInitialized) return this._datasource;
        return this._datasource.initialize();
    }

    /**
     * Create a new meili instance.
     * @returns MeiliSearch
     */
    private createMeiliInstance() {
        if(!this._meili) {
            this._meili = new MeiliSearch({
                host: `${process.env.MEILISEARCH_HOST}:${process.env.MEILISEARCH_PORT}`,
                headers: {
                    "Authorization": `Bearer ${process.env.MEILISEARCH_KEY}`
                }
            })
        }

        return this._meili;
    }

    public meiliClient() {
        return this._meili;
    }

    public getFileSystem() {
        return this._fileSystem;
    }

    public static instance(): Promise<DBWorker> {
        return new Promise((resolve) => {
            if(!DBWorker._instance) {
                DBWorker._instance = new DBWorker();
            }
    
            resolve(DBWorker._instance);
        })
    }
}