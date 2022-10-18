import path from "node:path"

// Roles
export const ROLE_ADMIN = "admin";
export const ROLE_MOD = "mod";

// Base urls
export const GENIUS_API_BASE_URL = "https://genius.com/api"

// Queue names
export const QUEUE_INDEX_NAME = "index-queue"
export const QUEUE_FILE_NAME = "file-queue"
export const QUEUE_MOUNTSCAN_NAME = "mount-scan-queue"
export const QUEUE_INDEXER_NAME = "indexer-queue"
export const QUEUE_GENIUS_NAME = "genius-queue"

// Database connection names
export const TYPEORM_CONNECTION_SCANWORKER = "scan-worker-connection"
export const TYPEORM_CONNECTION_INDEXER = "indexer-connection"
export const TYPEORM_CONNECTION_GENERAL = "default"

// Internal events
export const EVENT_FILES_FOUND = "files-found-event"
export const EVENT_FILES_PROCESSED = "files-processed-event"
export const EVENT_SONGS_CHANGED = "songs-changed-event"
export const EVENT_ALBUMS_CHANGED = "albums-changed-event"
export const EVENT_ARTISTS_CHANGED = "artists-changed-event"
export const EVENT_PLAYLISTS_CHANGED = "playlists-changed-event"

export const EVENT_METADATA_CREATED = "metadata-created-event"

// TypeORM
export const TYPEORM_ENTITY_GLOB = path.join(process.cwd(), "**/*.entity{ .ts,.js}");
