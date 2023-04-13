import { SCNGXTracklist } from "./tracklist.entity"

export type ResourceWithTracklist<T = object> = T & {
    tracklist: SCNGXTracklist;
}