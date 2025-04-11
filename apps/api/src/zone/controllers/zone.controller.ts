import { Controller, Get, Param } from '@nestjs/common';
import { Pagination } from '@repo/nestjs';
import { Pageable } from '@repo/utilities';
import { Roles } from '../../authentication/decorators/role.decorator';
import { Zone } from '../entities/zone.entity';
import { ZoneService } from '../services/zone.service';

@Controller('zones')
export class ZoneController {
  constructor(private readonly service: ZoneService) { }

  @Roles("admin")
  @Get(":zoneId")
  public async findById(@Param("zoneId") zoneId: string): Promise<Zone> {
    return this.service.findById(zoneId);
  }

  @Roles("admin")
  @Get()
  public async findAll(@Pagination() pageable: Pageable) {
    return this.service.findPage(pageable);
  }

}
