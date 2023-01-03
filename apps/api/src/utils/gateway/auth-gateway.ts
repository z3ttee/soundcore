import { ForbiddenException, Logger, UnauthorizedException } from "@nestjs/common";
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from "@nestjs/websockets";
import { catchError, of } from "rxjs";
import { Server, Socket } from "socket.io";
import { KeycloakTokenPayload } from "../../authentication/entities/oidc-token.entity";
import { OIDCUser } from "../../authentication/entities/oidc-user.entity";
import { OIDCService } from "../../authentication/services/oidc.service";
import { User } from "../../user/entities/user.entity";
import { UserService } from "../../user/user.service";

export class AuthGatewayRegistry {

    public static users: Record<string, User>;

}
export abstract class AuthGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(AuthGateway.name);

    @WebSocketServer()
    protected server: Server;

    /**
     * Object that stores the socket's id 
     * as key for the user data object.
     */
    private readonly authenticatedSockets: Map<string, User> = new Map();

    /**
     * Object that stores the socket's id
     * as key for the socket itself.
     */
    protected readonly sockets: Map<string, Socket> = new Map();

    /**
     * Object that stores user's id as key
     * for the socket's id the user corresponds to.
     */
    private readonly userToSocket: Map<string, string> = new Map();

    constructor(
        private readonly userService: UserService,
        private readonly oidcService: OIDCService
    ) {}
    
    public async handleConnection(socket: Socket): Promise<any> {
        const tokenValue = socket.handshake.auth["token"];

        return new Promise<User>((resolve, reject) => {
            this.oidcService.verifyAccessToken(tokenValue).pipe(catchError((error: Error) => {
                reject(error);
                return of(null);
            })).subscribe((token: KeycloakTokenPayload) => {
                if(typeof token === "undefined" || token == null) {
                    reject(new UnauthorizedException("Authorization required."));
                    return;
                }
    
                const roles = token?.realm_access?.roles || [];
    
                this.canAccessGateway(roles).then((canAccessGateway) => {
                    if(!canAccessGateway) {
                        reject(new ForbiddenException("User not allowed to access this gateway"));
                        return;
                    }
                        
                    this.userService.findOrCreateByTokenPayload(token).then((user) => {
                        resolve(user);
                    }).catch((error: Error) => {
                        this.logger.warn(`Failed syncing user data with database: ${error.message}`);
                        reject(error);
                    });
                }).catch((error: Error) => {
                    reject(error);
                });
            });
        }).then((user) => {
            // Connection authorized
            this.sockets.set(socket.id, socket);
            this.userToSocket.set(user.id, socket.id);
            this.authenticatedSockets.set(socket.id, user);

            this.onConnect(socket, user);
        }).catch((error: Error) => {
            // Connection unauthorized
            socket.disconnect();
    
            if(!(error instanceof ForbiddenException)) {
                this.logger.warn(`Blocked unauthenticated socket connection: ${error.message}`);
            }
        })
    }

    public handleDisconnect(socket: Socket) {
        const socketId: string = socket.id
        const user = this.getUserBySocketId(socketId);

        this.authenticatedSockets.delete(socketId);
        this.sockets.delete(socketId);

        if(user) {
            this.userToSocket.delete(user.id);
            this.onDisconnect(socket, user);
        }
    }

    private getSocketById(socketId: string) {
        return this.sockets.get(socketId);
    }

    private getUserBySocketId(socketId: string) {
        return this.authenticatedSockets.get(socketId);
    }

    /**
     * Get the socket that corresponds to a connect user
     * by the user's id.
     * @param userId User's id
     * @returns Socket
     */
    protected getAuthenticatedSocket(userId: string): Socket {
        const socketId: string = this.userToSocket.get(userId);
        return this.sockets.get(socketId);
    }

    /**
     * Handle connection events.
     * Return true if the user is allowed to access the gateway
     * @param socket Socket
     * @param user User
     */
    protected abstract canAccessGateway(roles: string[]): Promise<boolean>;

    protected onConnect(socket: Socket, user: User): Promise<void> { /** Do nothing */ return; };
    protected onDisconnect(socket: Socket, user: User): Promise<void> { /** Do nothing */ return; };

}