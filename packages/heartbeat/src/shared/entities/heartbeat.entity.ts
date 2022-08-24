
export enum ServiceStatus {

    ONLINE = 0,
    OFFLINE = 1

}

export class Heartbeat<T = any> {

    constructor(
        public readonly from: string,
        public readonly staticPayload?: T,
        public readonly sentAt: number = Date.now()
    ) {}

}