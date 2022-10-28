import { Injectable } from "@nestjs/common";
import { Heartbeat, OnHeartbeat } from "@soundcore/heartbeat";
import { DiscoveryPayload } from "../entities/discovery-payload.entity";

@Injectable()
export class DiscoveryService {

    /**
     * Stores the url of a service using the client's identifier
     * as key.
     */
    private readonly _registry: Map<string, string> = new Map();

    /**
     * Find the url on which the service can be accessed.
     * @param clientId Client's id
     * @returns URL in string format
     */
    public async findUrlByClientId(clientId: string): Promise<string> {
        return this._registry.get(clientId);
    }

    @OnHeartbeat()
    public onHeartbeat(heartbeat: Heartbeat<DiscoveryPayload>) {
        this._registry.set(heartbeat.clientId, heartbeat.payload.clientUrl);
    }

}