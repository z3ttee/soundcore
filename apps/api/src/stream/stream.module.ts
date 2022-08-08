import { Module } from '@nestjs/common';
import { StreamService } from './services/stream.service';
import { StreamController } from './stream.controller';
import { SongModule } from '../song/song.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StreamTokenService } from './services/stream-token.service';
import { JwtModule } from '@nestjs/jwt';
import { v4 as uuidv4 } from "uuid"
import { Stream } from './entities/stream.entity';

@Module({
  controllers: [
    StreamController
  ],
  providers: [
    StreamService,
    StreamTokenService
  ],
  imports: [
    SongModule,
    TypeOrmModule.forFeature([ Stream ]),
    JwtModule.register({
      verifyOptions: {
        ignoreExpiration: true
      },
      secret: uuidv4()
    })
  ]
})
export class StreamModule {}
