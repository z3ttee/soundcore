export enum ZoneOnlineStatus {
    UP = "up"
}
export enum ZoneEnvironment {
    DOCKER = "docker",
    STANDALONE = "standalone"
}

export interface Zone {
    readonly id: string;
    readonly status: ZoneOnlineStatus;
    readonly environment: ZoneEnvironment;
    readonly name: string;
    readonly platform: string;
    readonly arch: string;
    readonly createdAt: number;
    readonly updatedAt: number;
}
