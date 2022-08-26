
export enum ClientStatus {

    ONLINE = 0,
    OFFLINE = 1

}

export class Heartbeat<T = any> {

    constructor(
        public readonly clientId: string,
        public readonly staticPayload?: T,
        public readonly sentAt: number = Date.now()
    ) {}

}

export class HeartbeatReport {

    constructor(
        public readonly amount: number,
        public readonly lastHeartbeatAt: number = Date.now()
    ) {}

}