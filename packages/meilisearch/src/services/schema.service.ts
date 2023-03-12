import { Injectable } from "@nestjs/common";
import { IndexSchema } from "../definitions";
import { MeiliIndex } from "../entities/index.entity";
import { getSchemaToken } from "../utils/asyncProvider";

const indexes: Map<string, MeiliIndex> = new Map();

@Injectable()
export class SchemaService {
    private readonly _schemas: Map<string, IndexSchema> = new Map();

    constructor(schemas: IndexSchema[]) {
        this._schemas = new Map(schemas.map((schema) => ([ getSchemaToken(schema), schema ])));
    }

    public get(uid: string): IndexSchema {
        return this._schemas.get(uid);
    }

    public register(uid: string, schema: IndexSchema) {
        if(this._schemas.has(uid)) {
            throw new Error(`Registering schemas using identical uids is not allowed`);
        }

        this._schemas.set(uid, schema);
    }

}