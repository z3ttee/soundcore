/*
 * Public API Surface of soundcore-sdk
 */
export { ApplicationBuildInfo, ApplicationInfo, SCSDKAppService } from "./app.service";
export { SCSDKModule } from "./scdk.module";
export type { SCSDKOptions } from "./scdk.module";

// Gateways
export * from "./gateway";

// Tracklist
export * from "./tracklist";

// Logger
export * from "./logging";

// Stream Module
export * from "./stream";

// Playlist Module
export * from "./playlist";

// Profile Module
export * from "./profile";

// Import Module
export * from "./import";

// Utils
export * from "./utils/datasource";

// Mount Module
export * from "./mount";

// Song Module
export * from "./song";

// Collection Module
export * from "./collection";

// Search Module
export * from "./search";

// Zone Module
export * from "./zone";

// Tasks Module
export * from "./tasks";

// Metrics Module
export * from "./metrics";

// Configure Module
export * from "./configure";

// Artist Module
export * from "./artist";


// Utils
export * from "./utils/error/api-error";
export * from "./utils/responses/api-response";
export * from "./utils/results/creation.result";
export * from "./utils/rxjs/operators/api-response";

// Meilisearch
export * from "./meilisearch/entities/meili-album.entity";
export * from "./meilisearch/entities/meili-artist.entity";
export * from "./meilisearch/entities/meili-artwork.entity";
export * from "./meilisearch/entities/meili-genre.entity";
export * from "./meilisearch/entities/meili-playlist.entity";
export * from "./meilisearch/entities/meili-song.entity";
export * from "./meilisearch/entities/meili-user.entity";
export * from "./meilisearch/entities/search-response.entity";

// File Module
export * from "./file/entities/file.entity";
export * from "./file/file.module";
export * from "./file/services/file.service";

// User Module
export * from "./user/entities/user.entity";
export * from "./user/services/user.service";
export * from "./user/user.module";

// Genre Module
export * from "./genre/entities/genre.entity";
export * from "./genre/services/genre.service";

/**
 * Export all album sdk parts
 */
export * from "./album/album.module";
export * from "./album/entities/album.entity";
export * from "./album/services/album.service";

/**
 * Export all artwork sdk parts
 */
export * from "./artwork/artwork.module";
export * from "./artwork/entities/artwork.entity";
export * from "./artwork/services/artwork.service";

/**
 * Export all utils
 */
export * from "./utils/entities/resource";

/**
 * Export all datastructures
 */
export * from "./utils/structures/resource-list";
export * from "./utils/structures/resource-map";
export * from "./utils/structures/resource-queue";
export * from "./utils/structures/resource-queue-map";

/**
 * Notification SDK
 */
export * from "./notification/entities/notification.entity";
export * from "./notification/notification.module";
export * from "./notification/services/notification.service";

/**
 * Settings SDK
 */
export * from "./settings/entities/settings.entity";
export * from "./settings/services/settings.service";
export * from "./settings/settings.module";


