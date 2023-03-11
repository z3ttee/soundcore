# Soundcore Meilisearch Library
Meilisearch library that wraps meilisearch-js into a NestJS module

## Installation
```bash
npm install --save @soundcore/meilisearch
```
or using yarn
```bash
yarn add @soundcore/meilisearch
```

## Usage
First, you have to register the module in your `app.module.ts`:
```javascript
import { Module } from '@nestjs/common';
import { MeilisearchModule } from '@soundcore/meilisearch';

@Module({
  imports: [
    MeilisearchModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        host: configService.get("meilisearch.host"),
        port: configService.get("meilisearch.port"),
        key: configService.get("meilisearch.key")
      })
    })
  ],
})
export class AppModule {}
```

// TODO