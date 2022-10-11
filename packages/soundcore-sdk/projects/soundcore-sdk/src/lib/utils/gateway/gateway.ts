import { io, Socket } from "socket.io-client";
import { SSOService } from "@soundcore/sso";

export interface AuthenticatedGatewayOptions {
    url: string;
}
export abstract class SCDKAuthenticatedGateway {

    protected socket: Socket;

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
        })

        this.init();
    }

    protected abstract init(): void;

}