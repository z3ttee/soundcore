import { MountStatus } from "../../mount/enums/mount-status.enum";

export class MountStatusUpdateEvent {

    constructor(
        public readonly mountId: string,
        public readonly status: MountStatus,
        public readonly statusProgress?: number
    ) {}

}