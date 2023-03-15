/*
 * Public API Surface of soundcore-sdk
 */
export { SCSDKModule, SCSDKOptions } from "./lib/scdk.module";
export { SCSDKAppService, ApplicationInfo, ApplicationBuildInfo } from "./lib/app.service";

// Gateways
export * from "./lib/gateway";

// Pagination
export * from "./lib/pagination";

// Tracklist
export * from "./lib/tracklist";

// Logger
export * from "./lib/logging";

// Stream Module
export * from "./lib/stream";

// Playlist Module
export * from "./lib/playlist";

// Profile Module
export * from "./lib/profile";

// Import Module
export * from "./lib/import";

// Futures
export * from "./lib/utils/future";

// Mount Module
export * from "./lib/mount";

// Song Module
export * from "./lib/song";

// Collection Module
export * from "./lib/collection";

// Search Module
export * from "./lib/search";

// Zone Module
export * from "./lib/zone";

// Tasks Module
export * from "./lib/tasks";

// Configure Module
export * from "./lib/configure";




// Utils
export * from "./lib/utils/responses/api-response";
export * from "./lib/utils/error/api-error";
export * from "./lib/utils/results/creation.result";
export * from "./lib/utils/rxjs/operators/api-response";

// Meilisearch
export * from "./lib/meilisearch/entities/meili-user.entity";
export * from "./lib/meilisearch/entities/meili-artwork.entity";
export * from "./lib/meilisearch/entities/meili-playlist.entity";
export * from "./lib/meilisearch/entities/search-response.entity";
export * from "./lib/meilisearch/entities/meili-artist.entity";
export * from "./lib/meilisearch/entities/meili-album.entity";
export * from "./lib/meilisearch/entities/meili-song.entity";
export * from "./lib/meilisearch/entities/meili-genre.entity";

// File Module
export * from "./lib/file/file.module";
export * from "./lib/file/entities/file.entity";
export * from "./lib/file/services/file.service";

// User Module
export * from "./lib/user/user.module";
export * from "./lib/user/entities/user.entity";
export * from "./lib/user/services/user.service";

// Genre Module
export * from "./lib/genre/services/genre.service";
export * from "./lib/genre/entities/genre.entity";


/**
 * Export all artist sdk parts
 */
export * from "./lib/artist/artist.module";
export * from "./lib/artist/services/artist.service";
export * from "./lib/artist/entities/artist.entity";

/**
 * Export all album sdk parts
 */
export * from "./lib/album/album.module";
export * from "./lib/album/services/album.service";
export * from "./lib/album/entities/album.entity";

/**
 * Export all artwork sdk parts
 */
export * from "./lib/artwork/artwork.module";
export * from "./lib/artwork/services/artwork.service";
export * from "./lib/artwork/entities/artwork.entity";

/**
 * Export all utils
 */
export * from "./lib/utils/entities/resource";

/**
 * Export all datastructures
 */
export * from "./lib/utils/structures/resource-list";
export * from "./lib/utils/structures/resource-map";
export * from "./lib/utils/structures/resource-queue";
export * from "./lib/utils/structures/resource-queue-map";

/**
 * Notification SDK
 */
export * from "./lib/notification/notification.module";
export * from "./lib/notification/services/notification.service";
export * from "./lib/notification/entities/notification.entity";

/**
 * Settings SDK
 */
export * from "./lib/settings/settings.module";
export * from "./lib/settings/services/settings.service";
export * from "./lib/settings/entities/settings.entity";


