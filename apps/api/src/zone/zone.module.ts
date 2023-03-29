import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ZoneService } from './services/zone.service';
import { ZoneController } from './controllers/zone.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Zone } from './entities/zone.entity';

@Module({
  controllers: [
    ZoneController,
  ],
  providers: [
    ZoneService, 
  ],
  exports: [ ZoneService ],
  imports: [
    TypeOrmModule.forFeature([ Zone ])
  ]
})
export class ZoneModule implements OnModuleInit {
  private readonly _logger: Logger = new Logger(ZoneModule.name);

  constructor(
    private readonly service: ZoneService
  ){}
  
  public async onModuleInit(): Promise<void> {
    await this.service.initializeLocalZone().then((result) => {
      this._logger.log(`Initialized local zone. Identified as zone '${result.name}' on platform '${result.platform}' running in '${result.environment}' mode`);
    }).catch((error: Error) => {
      this._logger.error(`Failed initializing local zone: ${error.message}`, error.stack);
    });
  }
  
}
