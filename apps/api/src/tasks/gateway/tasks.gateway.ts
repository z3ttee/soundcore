import { WebSocketGateway } from "@nestjs/websockets";
import { OIDCService } from "../../authentication/services/oidc.service";
import { GATEWAY_EVENT_TASK_EMIT } from "../../constants";
import { UserService } from "../../user/user.service";
import { AuthGateway } from "../../utils/gateway/auth-gateway";
import { Task } from "../entities/task.entity";

@WebSocketGateway({
    cors: {
      origin: "*"
    },
    path: "/tasks",
    transports: [ "websocket", "polling" ]
})
export class TasksGateway extends AuthGateway {

    constructor(userService: UserService, oidcService: OIDCService) {
        super(userService, oidcService);
    }

    protected async canAccessGateway(roles: string[]): Promise<boolean> {
        return roles.includes("admin");
    }

    public async emitTasks(tasks: Task[]) {
        this.server.emit(GATEWAY_EVENT_TASK_EMIT, tasks);
    }
    
}