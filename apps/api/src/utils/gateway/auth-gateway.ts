import { OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { OIDCUser } from "../../authentication/entities/oidc-user.entity";
import { OIDCService } from "../../authentication/services/oidc.service";
import { User } from "../../user/entities/user.entity";
import { UserService } from "../../user/user.service";

export class AuthGatewayRegistry {

    public static users: Record<string, User>;

}
export abstract class AuthGateway implements OnGatewayConnection, OnGatewayDisconnect {

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
    
    public handleConnection(socket: Socket) {
        const token = socket.handshake.headers.authorization.slice("Bearer ".length);

        this.oidcService.client().introspect(token).then((introspect) => {
            if(!introspect.active) {
                socket.disconnect();
                return
            }

            this.userService.findOrCreateByKeycloakUserInstance(introspect as unknown as OIDCUser).then((user) => {
                this.sockets.set(socket.id, socket);
                this.userToSocket.set(user.id, socket.id);
                this.authenticatedSockets.set(socket.id, user);
                this.onConnect(socket, user);
            }).catch((error) => {
                console.error(error)
                socket.disconnect();
            })
        }).catch((error: Error) => {
            console.error(error);
            socket.disconnect();
        })
        
    }

    public handleDisconnect(socket: Socket) {
        const socketId: string = socket.id
        const user = this.getUserBySocketId(socketId);

        this.userToSocket.delete(user.id);
        this.authenticatedSockets.delete(socketId);
        this.sockets.delete(socketId);
        this.onDisconnect(socket, user);
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

    protected onConnect(socket: Socket, user: User) {/** */}
    protected onDisconnect(socket: Socket, user: User) {/** */}
}