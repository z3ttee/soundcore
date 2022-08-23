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