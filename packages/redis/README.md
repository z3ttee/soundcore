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

You can choose between 2 redis connections: One that is just for subscribing, publishing and a default one.
To inject just the connection to subscribe to messages, please do the following:

```
import { Injectable } from '@nestjs/common';
import { RedisSub } from "@soundcore/redis";

@Injectable()
export class AppService {
  constructor(private readonly redis: RedisSub) {}
}
```

This is done to prevent, that there is only one connection for developers to use. Because of the nature of redis,
if a connection goes into subscribtion mode, no messages can be published anymore. If you do not care about Pub/Sub,
then stick to the default `Redis` injection token shown in the first example of this section.

If you need more connections. You can register new connections in your modules using `registerConnections()`.

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
