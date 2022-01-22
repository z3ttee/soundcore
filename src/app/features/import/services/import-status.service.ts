import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { io, Socket } from "socket.io-client";
import { AuthenticationService } from "src/app/sso/authentication.service";
import { environment } from "src/environments/environment";
import { SocketStatus } from "../../upload/enums/socket-status.enum";
import { ImportEntity, ImportProgressUpdate } from "../entities/import.entity";

const IMPORT_STATUS_EVENT = "onImportStatusUpdate"
const IMPORT_PROGRESS_EVENT = "onImportProgressUpdate"

@Injectable()
export class ImportStatusService {

    private _socket: Socket;

    private _socketConnectedSubject: BehaviorSubject<SocketStatus> = new BehaviorSubject(SocketStatus.CONNECTING);
    private _onUpdateSubject: Subject<ImportEntity> = new Subject();
    private _onProgressSubject: Subject<ImportProgressUpdate> = new Subject();

    public $socketConnected: Observable<SocketStatus> = this._socketConnectedSubject.asObservable();
    public $onImportUpdate: Observable<ImportEntity> = this._onUpdateSubject.asObservable();
    public $onProgressUpdate: Observable<ImportProgressUpdate> = this._onProgressSubject.asObservable();

    constructor(
        private authService: AuthenticationService
    ){
        this.connectToSocket();
    }

    /**
     * Establish connection with index-status socket to receive realtime indexing updates.
     * If the connection is not possible, then a little warning should appear by checking the
     * $socketAvailable Observable.
     */
    private async connectToSocket() {
        const url = new URL(environment.api_base_uri + "/import-status");
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
        this._socket.on(IMPORT_STATUS_EVENT, (data: ImportEntity) => this.handleIndexUpdateEvent(data));
        this._socket.on(IMPORT_PROGRESS_EVENT, (data: ImportProgressUpdate) => this.handleImportProgressEvent(data));

    }

    private async handleIndexUpdateEvent(data: ImportEntity) {
        this._onUpdateSubject.next(data);
    }
    private async handleImportProgressEvent(data: ImportProgressUpdate) {
        this._onProgressSubject.next(data)
    }

    private async handleDisconnectEvent() {
        console.warn("[IMPORT_STATUS] Disconnected from socket. Service is in limited use mode.")
        this._socketConnectedSubject.next(SocketStatus.UNAVAILABLE)
    }

    private async handleConnectEvent() {
        console.warn("[IMPORT_STATUS] Connected to socket. Listening for index status updates.")
        this._socketConnectedSubject.next(SocketStatus.OK)
    }

    private async handleConnectionError() {
        console.error("[IMPORT_STATUS] Could not create connection to socket. This either means there is no internet connection, the service may be down or your session is expired.")
        this._socketConnectedSubject.next(SocketStatus.UNAVAILABLE)
    }

    private async handleErrorEvent() {
        console.error("[IMPORT_STATUS] Error occured on socket connection.")
        this._socketConnectedSubject.next(SocketStatus.UNAVAILABLE)
    }

}