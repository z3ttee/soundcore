/*
 * Public API Surface of soundcore-sdk
 */
export * from "./lib/scdk.module";

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
 export * from "./lib/album/services/album.service";
 export * from "./lib/album/entities/album.entity";

/**
 * Export all artwork sdk parts
 */
 export * from "./lib/artwork/entities/artwork.entity";

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

