import { Controller, Get, Param } from '@nestjs/common';
import { Pageable, Pagination } from '@soundcore/common';
import { Roles } from '../../authentication/decorators/role.decorator';
import { Zone } from '../entities/zone.entity';
import { ZoneService } from '../services/zone.service';

@Controller('zones')
export class ZoneController {
  constructor(private readonly service: ZoneService) {}

  @Roles("admin")
  @Get(":bucketId")
  public async findById(@Param("bucketId") bucketId: string): Promise<Zone> {
    return this.service.findById(bucketId);
  }

  @Roles("admin")
  @Get()
  public async findAll(@Pagination() pageable: Pageable) {
    return this.service.findPage(pageable);
  }

}
