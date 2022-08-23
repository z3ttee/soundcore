import { Injectable, Logger } from "@nestjs/common";
import Redis from "ioredis";
import { REDIS_SUBSCRIBE_CHANNELS } from "../constants";
import { Subscriber, RedisTarget } from "../decorators/subscribe.decorator";

@Injectable()
export class SoundcoreRedisService {
    private readonly _logger: Logger = new Logger("SoundcoreRedis");

    constructor(
        private readonly redis: Redis,
    ) {
        this.registerSubscribers();
    }

    private registerSubscribers() {
        // Get metadata and registered subscribers
        const subscribers: Map<string, Subscriber> = Reflect.get(RedisTarget, REDIS_SUBSCRIBE_CHANNELS) || new Map();
        const channels = subscribers.keys();

        this.redis.subscribe(...channels, (err, count) => {
            // Handle subscribe errors
            if(err) {
                this._logger.error(`Failed to subscribe to some channels: ${err.message}`, err.stack);
                return;
            }

            // Subscribe to messages
            this.redis.on("message", (channel, payload) => {
                const subscriber = subscribers.get(channel);
                if(typeof subscriber === "undefined" || subscriber == null) return;

                if(subscriber.expectJson) {
                    let parsedJSON = {};

                    try {
                        parsedJSON = JSON.parse(payload);
                    } catch (err: any) {
                        this._logger.error(`Could not parse json of message on channel '${channel}': ${err.message}`, payload);
                    }

                    subscriber.handler.value(channel, parsedJSON);
                } else {
                    subscriber.handler.value(channel, payload)
                }
            })

            this._logger.log(`This client is currently listening on ${count} channels.`);
        })
    }

}