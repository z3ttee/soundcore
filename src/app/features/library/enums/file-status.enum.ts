
export enum FileStatus {

    STATUS_DUPLICATE = "duplicate",
    STATUS_PROCESSING = "processing",
    STATUS_AVAILABLE = "available",
    STATUS_UNAVAILABLE = "unavailable",
    STATUS_LOOKUP_LYRICS = "lookup_lyrics",
    // This happens, if ffmpeg throwed error but entry in database was created.
    // This exists to inform users.
    STATUS_CORRUPTED = "corrupted",

    // Only client-side
    STATUS_UPLOADING = "uploading",
    STATUS_AWAIT_UPLOAD = "awaiting",
    STATUS_ERRORED = "errored"

}