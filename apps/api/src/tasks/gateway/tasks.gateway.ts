import { WebSocketGateway } from "@nestjs/websockets";
import { GATEWAY_EVENT_TASK_EMIT } from "../../constants";
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

    protected async canAccessGateway(roles: string[]): Promise<boolean> {
        return roles.includes("admin");
    }

    public async emitTasks(tasks: Task[]) {
        console.log("emitting " + tasks.length + " tasks")
        this.server.emit(GATEWAY_EVENT_TASK_EMIT, tasks);
    }
    
}