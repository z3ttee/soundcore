import { DataSource, DataSourceOptions } from "typeorm";
import { TYPEORM_ENTITY_GLOB } from "../../constants";

class DatabaseImpl {
    private static instance: DatabaseImpl;

    constructor() {
        if(!DatabaseImpl.instance) {
            DatabaseImpl.instance = this;
        }

        return DatabaseImpl.instance;
    }

    private _dataSourceOptions: DataSourceOptions = {
        type: process.env.DB_DIALECT as any || "mariadb",
        port: parseInt(process.env.DB_PORT),
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASS,
        username: process.env.DB_USER,
        entityPrefix: process.env.DB_PREFIX || "sc_",
        entities: [
            TYPEORM_ENTITY_GLOB
        ]
    }

    private _datasource: DataSource = new DataSource(this._dataSourceOptions);

    public async connect(): Promise<DataSource> {
        if(this._datasource.isInitialized) return this._datasource;
        return this._datasource.initialize();
    }

}


const Database = new DatabaseImpl();
Object.freeze(Database);

export default Database;