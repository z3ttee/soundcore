import { Logger, Provider } from "@nestjs/common";
import { isUndefined, pascalToSnakeCase } from "@soundcore/common";
import { Config, IndexObject } from "meilisearch";
import { IndexOptions } from "../decorators/meilisearch.decorator";
import { IndexSchema } from "../definitions";
import { MeiliClient } from "../entities/client.entity";
import { MeiliIndex } from "../entities/index.entity";
import { MeilisearchRootOptions } from "../options";
import { getAllSchemaAttributes, getIndexOptions, getPrimaryAttribute, getSchemaAttributes, getSchemaRelations } from "./reflectUtils";

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
      const config = createMeiliConfig(options);
      const client = new MeiliClient(config, []);
      return client.getVersion().catch((error: Error) => {
        logger.error(`Could not connect to meilisearch instance: ${error.message}`, error.stack);
        logger.error(`Connection to meilisearch failed with following config:`, config);
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
      // Extract index options from reflect-metadata
      const options: IndexOptions = getIndexOptions(schema);

      // Check if schema has options
      if(isUndefined(options)) {
        logger.warn(`Please decorate index schemas using @MeiliIndex(). This is missing on '${schema.name}'`);
        return null;
      }

      

      // Create meilisearch connection config
      const config = createMeiliConfig(meiliOptions);
      // Extract primary key
      const primaryKeyAttr = getPrimaryAttribute(schema);
      // Extract index uid
      const uid = options.uid;
      // Register schema in client (used to get schema instances inside services)
      client.schemas.register(uid, schema);
      // Build index
      const index = client.index(uid);
      // Extract attributes
      const attributes = getAllSchemaAttributes(schema, logger);

      // Sort attributes
      const searchableAttrs: string[] = [];
      const filterableAttrs: string[] = [];
      const displayableAttrs: string[] = [];
      const sortableAttributes: string[] = [];

      for(const attr of attributes.values()) {
        if(attr.searchable) searchableAttrs.push(attr.attrName);
        if(attr.filterable) filterableAttrs.push(attr.attrName);
        if(attr.sortable) sortableAttributes.push(attr.attrName);
        if(attr.displayable) displayableAttrs.push(attr.attrName);
      }
      
      // Execute update task on meilisearch to update primary key
      return index.update({ primaryKey: primaryKeyAttr.attrName }).then((task) => {
        // Wait for changes to be done
        return index.waitForTask(task.taskUid).then(() => {
          // Send update settings request to change attribute settings
          return index.updateSettings({
            searchableAttributes: searchableAttrs,
            displayedAttributes: displayableAttrs,
            filterableAttributes: filterableAttrs,
            sortableAttributes: sortableAttributes,
            faceting: options.faceting,
            typoTolerance: options.typoTolerance
          }).then((task) => {
            // Wait for changes to be done
            return index.waitForTask(task.taskUid).then(() => {
              return index.getRawInfo().then((metadata) => {
                logger.log(`Updated index '${metadata.uid}' on meilisearch`);
                return new MeiliIndex(config, uid, primaryKeyAttr.attrName, schema, metadata);
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
  const options = getIndexOptions(schema);
  const uid = options.uid;
  const primaryKey = getPrimaryAttribute(schema)?.attrName ?? "id";

  return new MeiliIndex(config, uid, primaryKey, schema, metadata);
}