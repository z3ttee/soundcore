# Soundcore Redis Module
This package includes `ioredis` as NestJS Module.
It is a more lightweight version of `@nest-modules/ioredis` and contains only the necessary methods used in this monorepo.
Additionally, it introduces only support for NestJS 9.x.x

## Installation
```bash
npm install --save @soundcore/redis ioredis
```
or using yarn
```bash
yarn add @soundcore/redis ioredis
```

## Usage
First, you have to register the module in your `app.module.ts`:
```javascript
import { Module } from '@nestjs/common';
import { SoundcoreRedisModule } from '@soundcore/redis';

@Module({
  imports: [
    SoundcoreRedisModule.forRoot({
        // IORedis options go here
    })
  ]
})
export class AppModule {}
```
To configure the redis client, please read the docs of the [ioredis](https://github.com/luin/ioredis) package.
After that, you can inject the redis client in your services like that:
```javascript
import { Injectable } from '@nestjs/common';
import Redis from "ioredis";

@Injectable()
export class AppService {
  constructor(private readonly redis: Redis) {}
}
```

## Static Payload
If you want to send some static data via the heartbeat packet, you can do that be defining an object
on the `staticPayload` property when registering the `HeartbeatClientModule`.
The data defined there will then be sent at every heartbeat.

On the server side you can catch the heartbeat packet after it was processed by registering a handler
using the `@OnHeartbeat()` decorator. Please see the following example:

```javascript
import { Heartbeat, OnHeartbeat } from "@soundcore/heartbeat";

@OnHeartbeat()
public handleHeartbeat(heartbeat: Heartbeat) {
  // Handle payload
}
```

## Subscribe
Redis is known for its ability for Pub/Sub. To make subscribing to messages and channels more comfortable, a new decorator has been introduced: `@RedisSubscribe(channel: string, expectJSON: boolean)`. This is a method decorator and takes in 2 parameters. The first one specifies the channel to which the client should listen. The second parameter defines, wether the client should parse the JSON string to an actual JSON object or not. Please see the following example on how to use the decorator:

```javascript
import { RedisSubscribe } from "@soundcore/redis";

@RedisSubscribe("test", true)
public handleSubscribe(channel: string, payload: any) {
  console.log(channel, payload);
}

```

The example above would subscribe on the channel called "test" and parse the received messages to an JSON object. Please make sure that on these channels, only json strings
are sent. Otherwise it would cause parsing errors and the payload object may become a nullish value.