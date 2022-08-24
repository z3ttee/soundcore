
export enum ServiceStatus {

    ONLINE = 0,
    OFFLINE = 1

}

export class Heartbeat {

    constructor(
        public readonly from: string,
        public readonly sentAt: number = Date.now()
    ) {}

}