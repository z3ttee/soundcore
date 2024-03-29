import { MountProgress, MountStatus } from "../../mount/entities/mount.entity";

export class MountStatusUpdateEvent {

    constructor(
        public readonly mountId: string,
        public readonly status: MountStatus,
        public readonly progressPayload?: MountProgress
    ) {}

}