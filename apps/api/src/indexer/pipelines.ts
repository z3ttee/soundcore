
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

export const STEP_READ_TAGS = "read-id3-tags";
export const STEP_SAVE_ARTISTS = "create-artists";
export const STEP_SAVE_ALBUMS = "create-albums";
export const STEP_SAVE_SONGS = "create-songs";

// export const pipelines: PipelineOptions[] = [
//     {
//         id: INDEX_PIPELINE_ID,
//         name: "Index Library",
//         stages: [
//             // Scan mount
//             {
//                 id: STAGE_SCAN,
//                 name: "Scan Mount",
//                 scriptPath: path.join(__dirname, "pipelines", "scan.stage.js"),
//                 steps: [
//                     {
//                         id: STEP_CHECKOUT_MOUNT,
//                         name: "Checkout mount"
//                     },
//                     {
//                         id: STEP_LOOKUP_FILES,
//                         name: "Lookup files"
//                     },
//                     {
//                         id: STEP_INDEX_FILES,
//                         name: "Create database entries"
//                     }
//                 ]
//             },
//             // Extract metadata
//             {
//                 id: "extract-metadata",
//                 name: "Extract metadata",
//                 scriptPath: path.join(__dirname, "pipelines", "metadata.stage.js"),
//                 steps: [
//                     {
//                         id: STEP_READ_TAGS,
//                         name: "Read mp3 tags"
//                     },
//                     {
//                         id: STEP_SAVE_ARTISTS,
//                         name: "Creating artists"
//                     },
//                     {
//                         id: STEP_SAVE_ALBUMS,
//                         name: "Creating albums"
//                     },
//                     {
//                         id: STEP_SAVE_SONGS,
//                         name: "Creating songs"
//                     }
//                 ]
//             },
//             // TODO: Search metadata online
//         ]
//     }
// ]