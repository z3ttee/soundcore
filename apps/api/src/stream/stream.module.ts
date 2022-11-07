import { Module } from '@nestjs/common';
import { StreamService } from './services/stream.service';
import { StreamController } from './controllers/stream.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StreamTokenService } from './services/stream-token.service';
import { JwtModule } from '@nestjs/jwt';
import { v4 as uuidv4 } from "uuid"
import { Stream } from './entities/stream.entity';
import { FileModule } from '../file/file.module';

@Module({
  controllers: [
    StreamController
  ],
  providers: [
    StreamService,
    StreamTokenService
  ],
  imports: [
    FileModule,
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
