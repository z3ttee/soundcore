import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { io, Socket } from "socket.io-client";
import { AuthenticationService } from "src/app/services/authentication.service";
import { environment } from "src/environments/environment";
import { SocketStatus } from "../../upload/enums/socket-status.enum";
import { StorageMount } from "../model/storage-mount.model";

const MOUNT_STATUS_EVENT = "onMountUpdate"

@Injectable()
export class MountStatusService {

    private _socket: Socket;

    private _socketConnectedSubject: BehaviorSubject<SocketStatus> = new BehaviorSubject(SocketStatus.CONNECTING);
    private _updatesSubject: BehaviorSubject<StorageMount> = new BehaviorSubject(null);

    public $socketConnected: Observable<SocketStatus> = this._socketConnectedSubject.asObservable();
    public $updates: Observable<StorageMount> = this._updatesSubject.asObservable();

    constructor(
        private authService: AuthenticationService
    ){
        this.connectToSocket();
    }

    /**
     * Establish connection with mount-status socket to receive realtime mount updates.
     * If the connection is not possible, then a little warning should appear by checking the
     * $socketAvailable Observable.
     */
    private async connectToSocket() {
        const url = new URL(environment.api_base_uri + "/mount-status");
        const hostname = url.host;
        const pathname = url.pathname;

        console.log(hostname, pathname)
        this._socket = io(hostname, {
            path: pathname,
            extraHeaders: {
              "Authorization": "Bearer " + this.authService.getAccessToken()
            }
        })

        this._socket.on("disconnect", () => this.handleDisconnectEvent());
        this._socket.on("connect", () => this.handleConnectEvent());
        this._socket.on("error", () => this.handleErrorEvent());
        this._socket.on("connect_error", () => this.handleConnectionError());
        this._socket.on(MOUNT_STATUS_EVENT, (data: StorageMount) => this.handleUpdateEvent(data));
    }

    private async handleUpdateEvent(data: StorageMount) {
        console.log(data.status)
        this._updatesSubject.next(data);
    }

    private async handleDisconnectEvent() {
        console.warn("[MOUNT_STATUS] Disconnected from socket. Service is in limited use mode.")
        this._socketConnectedSubject.next(SocketStatus.UNAVAILABLE)
    }

    private async handleConnectEvent() {
        console.log("[MOUNT_STATUS] Connected to socket. Listening for mount status updates.")
        this._socketConnectedSubject.next(SocketStatus.OK)
    }

    private async handleConnectionError() {
        console.error("[MOUNT_STATUS] Could not create connection to socket. This either means there is no internet connection, the service may be down or your session is expired.")
        this._socketConnectedSubject.next(SocketStatus.UNAVAILABLE)
    }

    private async handleErrorEvent() {
        console.error("[MOUNT_STATUS] Error occured on socket connection.")
        this._socketConnectedSubject.next(SocketStatus.UNAVAILABLE)
    }

}