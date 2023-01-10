import { Zone } from "../../zone/entities/zone.entity";

export enum MountStatus {
    UP = 0,
    ENQUEUED = 1,
    BUSY = 2,
    ERRORED = 3
}

export interface MountProgressInfo {
    title: string;
    description: string;
}

export interface MountProgress {
    /**
     * Id of the mount
     */
    mountId: string;

    /**
     * Number of the current step
     */
    currentStep: number;

    /**
     * Max number of steps of
     * this process
     */
    maxSteps: number;

    /**
     * Progress in %
     * Set to -1, if progress cannot be calculated (indeterminate)
     */
    progress?: number;

    /**
     * Define title and description
     * of the current step
     */
    info: MountProgressInfo;
}

export class Mount {
    public id: string;
    public name: string;
    public directory: string;
    public createdAt: Date;
    public updatedAt: Date;
    public lastScannedAt: Date;
    public status: MountStatus;
    public isDefault: boolean;
    public discriminator: string;

    public bucket: Zone;
    public progressInfo: MountProgress;

    // Below fields may only be populated
    // after custom database queries.
    public filesCount?: number;
    public usedSpace?: number;

}