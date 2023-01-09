import { Mount } from "../../mount/entities/mount.entity";

export enum ZoneStatus {
    UP = "up"
}

export enum ZoneEnv {
    DOCKER = "docker",
    STANDALONE = "standalone"
}

export class Zone  {
    public id: string;
    public status: ZoneStatus;
    public environment: ZoneEnv;
    public name: string;
    public platform: "aix" | "android" | "darwin" | "freebsd" | "haiku" | "linux" | "openbsd" | "sunos" | "win32" | "cygwin" | "netbsd";
    public arch: "arm" | "arm64" | "ia32" | "mips" | "mipsel" | "ppc" | "ppc64" | "s390" | "s390x" | "x64";
    public mounts: Mount[];
    public createdAt: number;
    public updatedAt: number;

    public mountsCount?: number;
    public usedSpace?: number;

}