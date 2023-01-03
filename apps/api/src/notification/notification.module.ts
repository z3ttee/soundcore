import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationController } from './controllers/notification.controller';
import { NotificationService } from './services/notification.service';
import { NotificationGateway } from './gateway/notification.gateway';
import { UserModule } from '../user/user.module';
import { Notification } from './entities/notification.entity';

@Module({
  controllers: [
    NotificationController
  ],
  providers: [
    NotificationService,
    NotificationGateway
  ],
  imports: [
    UserModule,
    TypeOrmModule.forFeature([ Notification ])
  ],
  exports: [
    NotificationService
  ]
})
export class NotificationModule {}
