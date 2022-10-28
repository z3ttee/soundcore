import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { ProfileController } from './controllers/profile.controller';
import { ProfileService } from './services/profile.service';

@Module({
  controllers: [
    ProfileController
  ],
  providers: [
    ProfileService
  ],
  imports: [
    UserModule
  ],
  exports: [
    ProfileService
  ]
})
export class ProfileModule {}
