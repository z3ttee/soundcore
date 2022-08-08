import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtworkModule } from '../artwork/artwork.module';
import { User } from './entities/user.entity';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    TypeOrmModule.forFeature([ User ]),
    ArtworkModule
  ],
  exports: [
    UserService
  ]
})
export class UserModule {}
