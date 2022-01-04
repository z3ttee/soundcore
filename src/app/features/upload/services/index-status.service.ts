import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { io, Socket } from "socket.io-client";
import { AuthenticationService } from "src/app/services/authentication.service";
import { environment } from "src/environments/environment";
import { Index } from "../entities/index.entity";
import { SocketStatus } from "../enums/socket-status.enum";
import { UploadService } from "./upload.service";

const INDEX_STATUS_EVENT = "onIndexStatusUpdate"

@Injectable({
    providedIn: "root"
})
export class IndexStatusService {

    private _socket: Socket;

    private _socketConnectedSubject: BehaviorSubject<SocketStatus> = new BehaviorSubject(SocketStatus.CONNECTING);
    public $socketConnected: Observable<SocketStatus> = this._socketConnectedSubject.asObservable();

    constructor(
        private authService: AuthenticationService,
        private uploadService: UploadService
    ){
        this.connectToSocket();
    }

    /**
     * Establish connection with index-status socket to receive realtime indexing updates.
     * If the connection is not possible, then a little warning should appear by checking the
     * $socketAvailable Observable.
     */
    private async connectToSocket() {
        const socketUrl = environment.api_base_uri + "/index-status/";
        this._socket = io(`${socketUrl}`, {
            extraHeaders: {
              "Authorization": "Bearer " + this.authService.getAccessToken()
            }
        })

        this._socket.on("disconnect", () => this.handleDisconnectEvent());
        this._socket.on("connect", () => this.handleConnectEvent());
        this._socket.on("error", () => this.handleErrorEvent());
        this._socket.on("connect_error", () => this.handleConnectionError());
        this._socket.on(INDEX_STATUS_EVENT, (data: Index) => this.handleIndexUpdateEvent(data));
    }

    private async handleIndexUpdateEvent(data: Index) {
        this.uploadService.updateIndex(data)
    }

    private async handleDisconnectEvent() {
        console.warn("[INDEX_STATUS] Disconnected from socket. Service is in limited use mode.")
        this._socketConnectedSubject.next(SocketStatus.UNAVAILABLE)
    }

    private async handleConnectEvent() {
        console.warn("[INDEX_STATUS] Connected to socket. Listening for index status updates.")
        this._socketConnectedSubject.next(SocketStatus.OK)
    }

    private async handleConnectionError() {
        console.error("[INDEX_STATUS] Could not create connection to socket. This either means there is no internet connection, the service may be down or your session is expired.")
        this._socketConnectedSubject.next(SocketStatus.UNAVAILABLE)
    }

    private async handleErrorEvent() {
        console.error("[INDEX_STATUS] Error occured on socket connection.")
        this._socketConnectedSubject.next(SocketStatus.UNAVAILABLE)
    }

}