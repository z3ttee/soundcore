
export type SCDKResourceType = "song" | "user" | "playlist" | "album" | "collection" | "artist" | "genre" | "publisher" | "distributor" | "label" | "index" | "mount" | "bucket"

export interface SCDKResource {

    id: string;
    resourceType: SCDKResourceType;

}