import { Inject, Injectable, Logger } from "@nestjs/common";
import { RedisSub } from "@soundcore/redis";
import { HEARTBEAT_HANDLERS, HEARTBEAT_MESSAGE_CHANNEL, HEARTBEAT_OPTIONS, HEARTBEAT_TIMEOUT } from "../../constants";
import { Heartbeat, ServiceStatus } from "../../shared/entities/heartbeat.entity";
import { HeartbeatHandler, HeartbeatHandlerTarget } from "../decorators/heartbeat.decorator";
import { HeartbeatOptions } from "../heartbeat-server.module";

@Injectable()
export class HeartbeatServerService {
    private readonly _logger: Logger = new Logger("Heartbeat");
    private readonly _timeouts: Map<string, NodeJS.Timeout> = new Map();

    private readonly _latencyStats: Map<string, number> = new Map();
    private readonly _status: Map<string, ServiceStatus> = new Map();
    
    constructor(
        private readonly redisSub: RedisSub,
        @Inject(HEARTBEAT_OPTIONS) private readonly options: HeartbeatOptions
    ) {
        this.initialize();
    }

    private initialize() {
        this.redisSub.subscribe(HEARTBEAT_MESSAGE_CHANNEL, (err) => {
            if(err) {
                this._logger.error(`Failed subscribing to heartbeat message channel: ${err.message}`, err.stack);
            }

            this.redisSub.on("message", (channel: string, rawPayload: any) => {
                const receivedAt: number = Date.now();

                // Only allow acting upon messages of the heartbeat channel
                if(channel.toLowerCase() !== HEARTBEAT_MESSAGE_CHANNEL) return;

                // Parse heartbeat json string
                // and drop packet if there were parsing
                // errors.
                const heartbeat = this.parseHeartbeatPacket(rawPayload);
                if(!heartbeat) return;

                // Handle packet
                this.handleHeartbeatPacket(receivedAt, heartbeat);
            });
        });
    }

    private callAllHeartbeatHandlers(heartbeat: Heartbeat) {
        // Get metadata and registered subscribers
        const handlers: HeartbeatHandler[] = Reflect.get(HeartbeatHandlerTarget, HEARTBEAT_HANDLERS) || [];

        for(const handler of handlers) {
            this.callHeartbeatHandler(handler, heartbeat);
        }
    }

    private async callHeartbeatHandler(handler: HeartbeatHandler, heartbeat: Heartbeat) {
        handler.value(heartbeat)
    }

    private parseHeartbeatPacket(rawPayload: string): Heartbeat {
        try {
            return JSON.parse(rawPayload);
        } catch (err: any) {
            this._logger.error(`Received invalid heartbeat packet: ${err.message}`, err.stack);
            return null;
        }
    }

    private handleHeartbeatPacket(receivedAt: number, heartbeat: Heartbeat) {
        // Drop packet if sender is unknown
        if(typeof heartbeat.from === "undefined" || heartbeat.from == null) return null;

        // Calculate latency, if there is no sentAt date, set latency to -1
        let latency: number = -1;
        if(typeof heartbeat.sentAt !== "undefined" && heartbeat.sentAt != null && Number.isInteger(heartbeat.sentAt) && heartbeat.sentAt < Date.now()) latency = receivedAt - heartbeat.sentAt; 

        // Reset timeout
        const timeout = this._timeouts.get(heartbeat.from) || this._timeouts.set(heartbeat.from, this.createHeartbeatTimeout(heartbeat, latency)).get(heartbeat.from);
        timeout.refresh();
        this.setServiceStatus(heartbeat.from, ServiceStatus.ONLINE);

        // Create latency report
        this.createLatencyStats(heartbeat, latency);

        // Execute registered handlers
        this.callAllHeartbeatHandlers(heartbeat);
    }

    private createHeartbeatTimeout(heartbeat: Heartbeat, latency: number): NodeJS.Timeout {
        const timeoutMs = (this.options.timeout || HEARTBEAT_TIMEOUT) + (latency > 0 ? latency : 0);
        
        const timeout = setTimeout(() => {
            this._logger.warn(`Did not receive a heartbeat packet from client '${heartbeat.from}' during the last ${Number((timeoutMs)/1000).toFixed(2)}s.`);
            this.setServiceStatus(heartbeat.from, ServiceStatus.OFFLINE);
        }, timeoutMs);

        return timeout;
    }

    private createLatencyStats(heartbeat: Heartbeat, latency: number) {
        const previousAverage = this._latencyStats.get(heartbeat.from);

        if(latency < 0 || typeof previousAverage === "undefined" || previousAverage == null) {
            return this._latencyStats.set(heartbeat.from, latency).get(heartbeat.from);
        }

        return this._latencyStats.set(heartbeat.from, Number(((previousAverage + latency) / 2).toFixed(2))).get(heartbeat.from);
    }

    private setServiceStatus(from: string, status: ServiceStatus) {
        const currentStatus = this._status.get(from);
        this._status.set(from, status);

        if(currentStatus !== status) {
            this._logger.log(`Client '${from}' switched status to ${status === ServiceStatus.ONLINE ? 'ONLINE' : 'OFFLINE'}`);
        }
    }

}