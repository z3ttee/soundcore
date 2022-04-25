/*
 * Public API Surface of soundcore-sdk
 */
export * from "./lib/scdk.module";

/**
 * Export all artist sdk parts
 */
export * from "./lib/artist/artist.module";
export * from "./lib/artist/services/artist.service";
export * from "./lib/artist/entities/artist.entity";

/**
 * Export all user sdk parts
 */
export * from "./lib/user/user.module";
export * from "./lib/user/entities/user.entity";


/**
 * Export all song sdk parts
 */
export * from "./lib/song/song.module";
export * from "./lib/song/services/song.service";
export * from "./lib/song/entities/song.entity";

/**
 * Export all playlist sdk parts
 */
export * from "./lib/playlist/playlist.module";
export * from "./lib/playlist/services/playlist.service";
export * from "./lib/playlist/entities/playlist.entity";
export * from "./lib/playlist/entities/playlist-item.entity";
export * from "./lib/playlist/dtos/create-playlist.dto";
export * from "./lib/playlist/dtos/update-playlist.dto";
export * from "./lib/playlist/events/playlist.event";
export * from "./lib/playlist/events/songs.event";

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

/**
 * Export all utils
 */
export * from "./lib/pagination/page";
export * from "./lib/pagination/pageable";

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
