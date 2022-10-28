import { REDIS_SUBSCRIBE_CHANNELS } from "../constants";

class RedisSubscribeContext {}
export const RedisTarget = new RedisSubscribeContext();

export class Subscriber {
    constructor(
        public readonly channel: string,
        public readonly expectJson: boolean,
        public readonly handler: TypedPropertyDescriptor<(channel: string, payload: any) => void>
    ) {}
}

export function RedisSubscribe(channel: string, expectJson?: boolean) {
    return function (target: any, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) {
        const subscribers = Reflect.get(RedisTarget, REDIS_SUBSCRIBE_CHANNELS) as Map<string, Subscriber> || new Map();
        subscribers.set(channel, new Subscriber(channel, expectJson, descriptor));

        Reflect.set(RedisTarget, REDIS_SUBSCRIBE_CHANNELS, subscribers);
        return descriptor;
    }
}