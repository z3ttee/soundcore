import { KeycloakService } from "keycloak-angular";
import { io, Socket } from "socket.io-client";

export interface AuthenticatedGatewayOptions {
    url: string;
}
export abstract class SCDKAuthenticatedGateway {

    protected socket: Socket;

    constructor(
        private readonly _url: URL,
        protected readonly keycloakService: KeycloakService
        // private readonly options: AuthenticatedGatewayOptions
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
                "Authorization": "Bearer " + (await this.keycloakService.getToken())
            }
        })

        this.init();
    }

    protected abstract init(): void;

}