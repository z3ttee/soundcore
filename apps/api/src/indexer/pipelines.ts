
export const PIPELINE_INDEX_ID = "index-music-library"
export const PIPELINE_INDEX_NAME = "Index Library"

export const STAGE_SCAN_ID = "scan-mount"
export const STAGE_SCAN_NAME = "Scan Mount"
export const STEP_CHECKOUT_MOUNT_ID = "checkout-mount";
export const STEP_CHECKOUT_MOUNT_NAME = "Checkout Mount";
export const STEP_LOOKUP_FILES_ID = "lookup-files";
export const STEP_LOOKUP_FILES_NAME = "Searching files";
export const STEP_INDEX_FILES_ID = "index-files";
export const STEP_INDEX_FILES_NAME = "Sync with database";

export const STAGE_METADATA_ID = "extract-metadata"
export const STAGE_METADATA_NAME = "Extract metadata"
export const STEP_READ_TAGS_ID = "read-id3-tags";
export const STEP_READ_TAGS_NAME = "Read ID3 Tags";
export const STEP_CREATE_ARTISTS_ID = "create-artists";
export const STEP_CREATE_ARTISTS_NAME = "Create artist entities";
export const STEP_CREATE_ALBUMS_ID = "create-albums";
export const STEP_CREATE_ALBUMS_NAME = "Create album entities";
export const STEP_CREATE_SONGS_ID = "create-songs";
export const STEP_CREATE_SONGS_NAME = "Create song entities";
export const STEP_CHECK_FILES_ID = "check-files";
export const STEP_CHECK_FILES_NAME = "Check files";

export const STAGE_CLEANUP_ID = "cleanup-files";
export const STAGE_CLEANUP_NAME = "Updating files";
export const STEP_CLEANUP_FAILED_ID = "cleanup-failed-files";
export const STEP_CLEANUP_FAILED_NAME = "Update status of failed files";
export const STEP_CLEANUP_DUPLICATES_ID = "cleanup-duplicate-files";
export const STEP_CLEANUP_DUPLICATES_NAME = "Update status of duplicate files";
export const STEP_CLEANUP_SUCCEEDED_ID = "cleanup-succeeded-files";
export const STEP_CLEANUP_SUCCEEDED_NAME = "Update status of succeeded files";

export const STAGE_ARTWORK_ID = "create-artworks";
export const STAGE_ARTWORK_NAME = "Create artworks";
export const STEP_CREATE_ARTWORK_ENTITIES_ID = "database-sync";
export const STEP_CREATE_ARTWORK_ENTITIES_NAME = "Sync with Database";
export const STEP_CREATE_ARTWORKS_ID = "extract-artworks";
export const STEP_CREATE_ARTWORKS_NAME = "Extracting artworks";
