import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { BucketService } from './services/bucket.service';
import { BucketController } from './controllers/bucket.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Bucket } from './entities/bucket.entity';

@Module({
  controllers: [
    BucketController,
  ],
  providers: [
    BucketService, 
  ],
  exports: [ BucketService ],
  imports: [
    TypeOrmModule.forFeature([ Bucket ]),
    BullModule.registerQueue({
      name: "mount-queue"
    })
  ]
})
export class BucketModule implements OnModuleInit {
  private readonly _logger: Logger = new Logger(BucketModule.name);

  constructor(
    private readonly service: BucketService
  ){}
  
  public async onModuleInit(): Promise<void> {
    await this.service.initLocalBucket().then((result) => {
      this._logger.verbose(`Successfully initialized local bucket with id '${result.id}'`);
    }).catch((error: Error) => {
      this._logger.error(`Failed initializing local bucket: ${error.message}`, error.stack);
    });
  }
  
}
