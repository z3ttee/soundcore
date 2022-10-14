import { Mount } from "../../mount/entities/mount.entity";

export class MountUpdateEvent {

    constructor(
        public readonly mount: Mount,
        public readonly statusProgress?: number
    ) {}

}