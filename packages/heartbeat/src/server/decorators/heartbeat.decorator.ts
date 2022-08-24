import { HEARTBEAT_HANDLERS } from "../../constants";
import { Heartbeat } from "../../shared";

class HeartbeatHandlerContext {}
export const HeartbeatHandlerTarget = new HeartbeatHandlerContext();

export type HeartbeatHandler = TypedPropertyDescriptor<(heartbeat: Heartbeat) => void>;

export function OnHeartbeat() {
    return function (target: any, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) {
        const handlers = Reflect.get(HeartbeatHandlerTarget, HEARTBEAT_HANDLERS) as HeartbeatHandler[] || [];
        handlers.push(descriptor);

        Reflect.set(HeartbeatHandlerTarget, HEARTBEAT_HANDLERS, handlers);
        return descriptor;
    }
}