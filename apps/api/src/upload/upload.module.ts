import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { ZoneModule } from '../zone/zone.module';
import { MountModule } from '../mount/mount.module';

@Module({
  controllers: [UploadController],
  providers: [UploadService],
  imports: [
    ZoneModule,
    MountModule
  ]
})
export class UploadModule {



}
