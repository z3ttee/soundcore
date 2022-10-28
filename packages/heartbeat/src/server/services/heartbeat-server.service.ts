import { Inject, Injectable, Logger } from "@nestjs/common";
import { RedisSub } from "@soundcore/redis";
import { HEARTBEAT_HANDLERS, HEARTBEAT_MESSAGE_CHANNEL, HEARTBEAT_OPTIONS, HEARTBEAT_TIMEOUT } from "../../constants";
import { Heartbeat, ClientStatus, HeartbeatReport } from "../../shared/entities/heartbeat.entity";
import { Latency } from "../../shared/entities/latency.entity";
import { HeartbeatHandler, HeartbeatHandlerTarget } from "../decorators/heartbeat.decorator";
import { Health } from "../../shared/entities/health.entity";
import { HeartbeatServerOptions } from "../heartbeat-server.module";

@Injectable()
export class HeartbeatServerService {
    private readonly _logger: Logger = new Logger("Heartbeat");
    private readonly _timeouts: Map<string, NodeJS.Timeout> = new Map();

    private readonly _healths: Map<string, Health> = new Map();
    
    constructor(
        private readonly redisSub: RedisSub,
        @Inject(HEARTBEAT_OPTIONS) private readonly options: HeartbeatServerOptions
    ) {
        this.initialize();
    }

    /**
     * Find the current health report of a client.
     * This report contains information on online-status, network latency etc.
     * @param clientId Client's identifier
     * @returns Health
     */
    public async findHealthReportByClientId(clientId: string): Promise<Health> {
        return this._healths.get(clientId);
    }

    /**
     * Check if a client was registered already.
     * @param clientId Client's identifier
     * @returns True or False
     */
    public async existsClientId(clientId: string): Promise<boolean> {
        return this._healths.has(clientId);
    }

    /**
     * Find a list of health reports of all currently 
     * registered clients.
     * @returns Health[]
     */
    public async findAllHealthReports(): Promise<Health[]> {
        return Array.from(this._healths.values());
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

    private async handleHeartbeatPacket(receivedAt: number, heartbeat: Heartbeat) {
        // Drop packet if sender is unknown
        if(typeof heartbeat.clientId === "undefined" || heartbeat.clientId == null) return null;

        // Calculate latency, if there is no sentAt date, set latency to -1
        let latency: number = -1;
        if(typeof heartbeat.sentAt !== "undefined" && heartbeat.sentAt != null && Number.isInteger(heartbeat.sentAt) && heartbeat.sentAt < Date.now()) latency = receivedAt - heartbeat.sentAt; 

        // Reset timeout
        const timeout = this._timeouts.get(heartbeat.clientId) || this._timeouts.set(heartbeat.clientId, this.createHeartbeatTimeout(heartbeat, latency)).get(heartbeat.clientId);
        timeout.refresh();

        // Create health report
        await this.setClientHealth(heartbeat.clientId, heartbeat, latency);

        // Execute registered handlers
        this.callAllHeartbeatHandlers(heartbeat);
    }

    private createHeartbeatTimeout(heartbeat: Heartbeat, latency: number): NodeJS.Timeout {
        const timeoutMs = (this.options.timeout || HEARTBEAT_TIMEOUT) + (latency > 0 ? latency : 0);
        
        const timeout = setTimeout(() => {
            this._logger.warn(`Did not receive a heartbeat packet from client '${heartbeat.clientId}' during the last ${Number((timeoutMs)/1000).toFixed(2)}s.`);
            this.setClientStatus(heartbeat.clientId, ClientStatus.OFFLINE);
        }, timeoutMs);

        return timeout;
    }

    private async setClientHealth(clientId: string, heartbeat: Heartbeat, latency: number) {
        // Check if health report exists
        // for clientId
        if(this._healths.has(clientId)) {
            // If exists, update properties
            const health = this._healths.get(clientId);
            const avgLatency = Number((((health.network.lastLatency || 0) + latency) / 2).toFixed(2));

            // Update network and heartbeat report
            // Do not update online status, as it is done
            // at the end of this method.
            health.network = new Latency(latency, avgLatency);
            health.heartbeat = new HeartbeatReport((health.heartbeat?.amount || 0) + 1);
        } else {
            // Otherwise create new report
            this._healths.set(clientId, new Health(
                clientId, 
                null, 
                new Latency(latency, latency), 
                new HeartbeatReport(1)
            ));
        }

        // Initiate client status update and set
        // client to ONLINE
        await this.setClientStatus(clientId, ClientStatus.ONLINE);
    }

    /**
     * Set the online status of a client
     * @param clientId Client's identifier
     * @param status Client's updated status
     */
    private async setClientStatus(clientId: string, status: ClientStatus) {
        const health = await this.findHealthReportByClientId(clientId);
        if(typeof health === "undefined" || health == null || health.status === status) return;

        health.status = status;
        health.onlineSince = health.onlineSince ? health.onlineSince : Date.now();
        this._logger.log(`Client '${clientId}' switched status to ${status === ClientStatus.ONLINE ? 'ONLINE' : 'OFFLINE'}`);
    }

    
}