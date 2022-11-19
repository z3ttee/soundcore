import { io, Socket } from "socket.io-client";
import { SSOService } from "@soundcore/sso";
import { BehaviorSubject, Observable } from "rxjs";

export interface AuthenticatedGatewayOptions {
    url: string;
}

export enum GatewayDisconnectReason {
    CLOSED_BY_SERVER = "io server disconnect",
    MANUAL_DISCONNECT = "io client disconnect",
    TIMEOUT = "ping timeout",
    NETWORK_ISSUES = "transport close",
    FATAL_ERROR = "transport error",
    TOO_MANY_ATTEMPTS = "reconnect failed",
    RECONNECT_ERROR = "reconnect error"
}

export enum GatewayStatus {
    CONNECTED = "connected",
    CONNECTING = "connecting",
    DISCONNECTED = "disconnected"
}

export class GatewayConnection {

    public readonly status: GatewayStatus;
    public readonly disconnectReason?: GatewayDisconnectReason;
    public readonly reconnectAttempts?: number;
    public readonly $retry?: Observable<void>;
    
    constructor(status?: GatewayStatus, disconnectReason?: GatewayDisconnectReason, reconnectAttempts?: number, $retry?: Observable<void>) {
        this.status = status ?? GatewayStatus.CONNECTING;
        this.disconnectReason = disconnectReason ?? null;
        this.$retry = $retry ?? null;
        this.reconnectAttempts = reconnectAttempts ?? 0;
    }  

    public retry() {
        if(typeof this.$retry === "undefined" || this.$retry == null) return;
        this.$retry.subscribe();
    }

}

export abstract class SCSDKAuthenticatedGateway {

    protected socket: Socket;

    private readonly _connectionSubject: BehaviorSubject<GatewayConnection> = new BehaviorSubject(new GatewayConnection());
    public readonly $connection: Observable<GatewayConnection> = this._connectionSubject.asObservable();

    constructor(
        private readonly _url: URL,
        private readonly ssoService: SSOService
    ) {
        this.connect();
    }

    protected async connect() {
        console.log(this._url);
        const hostname = this._url.hostname;
        const port = this._url.port;
        const pathname = this._url.pathname;

        this.socket = io(`${hostname}:${port}`, {
            path: pathname,
            extraHeaders: {
                "Authorization": "Bearer " + (await this.ssoService.getAccessToken())
            }
        });

        this.socket.on("connect", () => {
            console.log("socket connected");
            // Socket has successfully connected
            this.updateConnection(new GatewayConnection(GatewayStatus.CONNECTED, null));
        });

        this.socket.on("disconnect", (reason, description) => {
            console.error("disconnect: ", description);

            // In case of CLOSED_BY_SERVER or MANUAL_DISCONNECT, socket.io library
            // will not reconnect automatically.
            if(reason == GatewayDisconnectReason.CLOSED_BY_SERVER || reason == GatewayDisconnectReason.MANUAL_DISCONNECT) {
                this.updateConnectionWithRetry(new GatewayConnection(GatewayStatus.DISCONNECTED, reason as GatewayDisconnectReason));
            } else {
                // Set status to connecting because socketio automatically retries connecting
                this.updateConnection(new GatewayConnection(GatewayStatus.CONNECTING, reason as GatewayDisconnectReason));
            }
        });

        // Listen on failed reconnect attempts.
        this.socket.on("reconnect_error", (error) => {
            console.error("reconnect_error: ", error);
        });

        // Listen on failed reconnect attempts.
        this.socket.on("reconnect_attempt", () => {
            console.error("reconnect_attempt");
            this.increaseReconnectAttempt();
        });

        // Listen on failed reconnect events. This only happens if the maximum
        // amount of retries has been reached
        this.socket.on("reconnect_failed", (error) => {
            console.error("reconnect_failed: ", error);
            this.updateConnectionWithRetry(new GatewayConnection(GatewayStatus.DISCONNECTED, GatewayDisconnectReason.TOO_MANY_ATTEMPTS));
        });

        this.socket.on("error", (error) => {
            console.error("error: ", error);
            this.updateConnection(new GatewayConnection(GatewayStatus.DISCONNECTED, GatewayDisconnectReason.FATAL_ERROR));
        });

        this.socket.on("connect_error", (error) => {
            console.error("connect_error: ", error);
            this.increaseReconnectAttempt();
        });

        this.registerEvents();
    }

    protected abstract registerEvents(): void;

    private updateConnection(connection: GatewayConnection) {
        const current = this.getConnectionInfo();

        // Update only if something has changed
        if(current.status != connection.status || current.reconnectAttempts != connection.reconnectAttempts || current.disconnectReason != connection.disconnectReason) {
            this._connectionSubject.next(connection);
        }
    }

    private updateConnectionStatus(status: GatewayStatus) {
        const connection = this.getConnectionInfo();
        const newCon = new GatewayConnection(status, connection.disconnectReason, connection.reconnectAttempts, connection.$retry);

        this.updateConnection(newCon);
    }

    private updateConnectionWithRetry(connection: GatewayConnection) {
        const $retryObservable = new Observable<void>((subscriber) => {
            subscriber.next();
            subscriber.complete();

            this.retryConnectionIfFailed();
        });    

        const withRetry = new GatewayConnection(
            connection.status, 
            connection.disconnectReason, 
            connection.reconnectAttempts,
            $retryObservable
        );

        this.updateConnection(withRetry);
    }

    private increaseReconnectAttempt() {
        const currentConInfo = this.getConnectionInfo();
        const newConInfo = new GatewayConnection(
            currentConInfo.status,
            currentConInfo.disconnectReason,
            currentConInfo.reconnectAttempts + 1,
            currentConInfo.$retry
        );

        this.updateConnection(newConInfo);
    }

    public getConnectionInfo(): GatewayConnection {
        return this._connectionSubject.getValue();
    }

    public retryConnectionIfFailed() {
        const info = this.getConnectionInfo();
        if(info.disconnectReason) {
            this.updateConnectionStatus(GatewayStatus.CONNECTING);
            console.warn(`Retrying gateway connection...`);
            this.socket.connect();
        }
    }

}