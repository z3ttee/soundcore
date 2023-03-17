
export interface MemoryInfo {
    used: number;
    total: number;
}

export interface CpuInfo {
    model: string;
}

export enum ApplicationMode {
    DOCKER = "docker",
    STANDALONE = "standalone"
}

export interface DeviceInfo {
    arch: string;
    cpu: CpuInfo[];
    memory: MemoryInfo;
    applicationMode: ApplicationMode;
}