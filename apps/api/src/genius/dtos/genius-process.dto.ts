import { Resource } from "../../utils/entities/resource";

export enum GeniusProcessType {
    SONG = 0,
    ARTIST,
    ALBUM
}

export class GeniusProcessDTO<T = Resource> {

    constructor(
        public readonly type: GeniusProcessType,
        public readonly payload: T,
    ) {}

}