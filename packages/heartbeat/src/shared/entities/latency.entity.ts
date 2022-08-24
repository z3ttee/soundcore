
export class HeartbeatLatency {

    public readonly average: number = -1;

    constructor(
        sum: number,
        public readonly heartbeats: number = 1
    ) {
        this.heartbeats = heartbeats;
        this.average = Number((sum/heartbeats).toFixed(2));
    }

}