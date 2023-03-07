import { Logger, Provider } from "@nestjs/common";
import { pascalToSnakeCase } from "@soundcore/common";
import { Config, IndexObject } from "meilisearch";
import { REFLECT_MEILIINDEX_DISPLAYABLE_ATTRS, REFLECT_MEILIINDEX_FILTERABLE_ATTRS, REFLECT_MEILIINDEX_OPTIONS, REFLECT_MEILIINDEX_PRIMARY_KEY, REFLECT_MEILIINDEX_SEARCHABLE_ATTRS, REFLECT_MEILIINDEX_SORTABLE_ATTRS } from "../constants";
import { IndexOptions } from "../decorators/index.decorator";
import { IndexSchema } from "../definitions";
import { MeiliClient } from "../entities/client.entity";
import { MeiliIndex } from "../entities/index.entity";
import { MeilisearchRootOptions } from "../options";

export function createOptionsProviderAsync(providerToken: string, inject: any[], useFactory: (...args: any[]) => Promise<MeilisearchRootOptions> | MeilisearchRootOptions): Provider<MeilisearchRootOptions> {
  return {
    provide: providerToken,
    inject: inject,
    useFactory: async (...args) => useFactory(args),
  }
}

/**
 * Create an async provider to initialize a new meilisearch client
 * @param inject Injection tokens for DI
 * @param logger Logger instance
 * @returns Provider
 */
export function createMeilisearchClient(inject: any[], logger: Logger): Provider {
  return {
    provide: MeiliClient,
    inject: inject,
    useFactory: async (options: MeilisearchRootOptions): Promise<MeiliClient> => {
      const client = new MeiliClient(createMeiliConfig(options), []);
      return client.getVersion().catch((error: Error) => {
        logger.error(`Could not collect to meilisearch instance: ${error.message}`, error.stack);
      }).then(() => {
        return client;
      })
    }
  }
}

/**
 * Create a new instance of meilisearch config
 * @param options Options to build config with
 * @returns Config
 */
export function createMeiliConfig(options: MeilisearchRootOptions): Config {
  return {
    host: `${options.host}:${options.port ?? 7700}`,
    headers: {
      "Authorization": `Bearer ${options.key}`
    }
  }
}

export function createIndexesAsyncProviders(inject: any[], schemas: IndexSchema[], logger: Logger): Provider[] {
  return schemas.map((schema) => ({
    provide: getSchemaToken(schema),
    inject: inject,
    useFactory: async (client: MeiliClient, meiliOptions: MeilisearchRootOptions): Promise<MeiliIndex<any>> => {
      // Check if schema has metadata
      if(!Reflect.hasMetadata(REFLECT_MEILIINDEX_OPTIONS, schema)){
        logger.warn(`Please decorate index schemas using @MeiliIndex(). This is missing on '${schema.name}'`);
        return null;
      }

      // Extract index options from decorator
      const options: IndexOptions = Reflect.getOwnMetadata(REFLECT_MEILIINDEX_OPTIONS, schema) ?? {};
      const uid = options.uid;
      const config = createMeiliConfig(meiliOptions);

      // Register schema in client
      client.schemas.register(uid, schema);
      
      // Extract primary key
      const primaryKey = Reflect.getOwnMetadata(REFLECT_MEILIINDEX_PRIMARY_KEY, schema) ?? "id";

      // Extract attribute options
      const searchableAttrs: string[] = Reflect.getMetadata(REFLECT_MEILIINDEX_SEARCHABLE_ATTRS, schema) ?? ["*"];
      const filterableAttrs: string[] = Reflect.getMetadata(REFLECT_MEILIINDEX_FILTERABLE_ATTRS, schema) ?? [];
      const displayableAttrs: string[] = Reflect.getMetadata(REFLECT_MEILIINDEX_DISPLAYABLE_ATTRS, schema) ?? ["*"];
      const sortableAttributes: string[] = Reflect.getMetadata(REFLECT_MEILIINDEX_SORTABLE_ATTRS, schema) ?? [];

      const index = client.index(uid);

      return index.update({ primaryKey: primaryKey }).then((task) => {
        return index.waitForTask(task.taskUid).then(() => {
          return index.updateSettings({
            searchableAttributes: searchableAttrs,
            displayedAttributes: displayableAttrs,
            filterableAttributes: filterableAttrs,
            sortableAttributes: sortableAttributes,
            faceting: options.faceting,
            typoTolerance: options.typoTolerance
          }).then((task) => {
            return index.waitForTask(task.taskUid).then(() => {
              return index.getRawInfo().then((metadata) => {
                return new MeiliIndex(config, uid, primaryKey, schema, metadata);
              }).catch((error: Error) => {
                logger.error(`Failed fetching metadata for index '${uid}: ${error.message}'`, error.stack);
                throw error;
              });
            });
          }).catch((error: Error) => {
            logger.error(`Failed updating settings on index '${uid}: ${error.message}'`, error.stack);
            throw error;
          });
        });
      }).catch((error: Error) => {
        logger.error(`Failed updating primary key on index '${uid}: ${error.message}'`, error.stack);
        throw error;
      });
    }
  }));
}

export function getSchemaToken(schema: IndexSchema) {
  return pascalToSnakeCase(schema.name);
}

export function createMeiliIndex(config: Config, schema: IndexSchema, metadata?: IndexObject) {
  const options: IndexOptions = Reflect.getOwnMetadata(REFLECT_MEILIINDEX_OPTIONS, schema) ?? {};
  const uid = options.uid;
  const primaryKey = Reflect.getOwnMetadata(REFLECT_MEILIINDEX_PRIMARY_KEY, schema) ?? "id";

  return new MeiliIndex(config, uid, primaryKey, schema, metadata);
}