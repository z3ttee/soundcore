/*
 * Public API Surface of soundcore-sdk
 */
export * from "./lib/scdk.module";

// Tracklist
export * from "./lib/song/entities/tracklist.entity";

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

// Pagination
export * from "./lib/utils/page/page";
export * from "./lib/utils/page/pageable";

// Bucket Module
export * from "./lib/bucket/bucket.module";
export * from "./lib/bucket/services/bucket.service";
export * from "./lib/bucket/entities/bucket.entity";

// Mount Module
export * from "./lib/mount/mount.module";
export * from "./lib/mount/services/mount.service";
export * from "./lib/mount/entities/mount.entity";
export * from "./lib/mount/enums/mount-status.enum";
export * from "./lib/mount/dtos/create-mount.dto";
export * from "./lib/mount/dtos/update-mount.dto";

// File Module
export * from "./lib/file/file.module";
export * from "./lib/file/entities/file.entity";
export * from "./lib/file/services/file.service";

// Playlist Module
export * from "./lib/playlist/playlist.module";
export * from "./lib/playlist/services/playlist.service";

export * from "./lib/playlist/entities/playlist.entity";
export * from "./lib/playlist/entities/playlist-item.entity";
export * from "./lib/playlist/entities/playlist-item-added.entity";

export * from "./lib/playlist/dtos/create-playlist.dto";
export * from "./lib/playlist/dtos/update-playlist.dto";
export * from "./lib/playlist/dtos/add-song.dto";

export * from "./lib/playlist/enums/playlist-privacy.enum";

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
 * Export all song sdk parts
 */
export * from "./lib/song/song.module";
export * from "./lib/song/services/song.service";
export * from "./lib/song/entities/song.entity";

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
 * Export all search sdk parts
 */
export * from "./lib/search/search.module";
export * from "./lib/search/services/search.service";
export * from "./lib/search/entities/search-result.model";
export * from "./lib/search/entities/best-match.entity";
export * from "./lib/search/entities/history-entry.entity";


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
 * Gateway SDK
 */
export * from "./lib/utils/gateway/gateway";

/**
 * Profile SDK
 */
export * from "./lib/profile/profile.module";
export * from "./lib/profile/services/profile.service";

/**
 * Settings SDK
 */
export * from "./lib/settings/settings.module";
export * from "./lib/settings/services/settings.service";
export * from "./lib/settings/entities/settings.entity";


