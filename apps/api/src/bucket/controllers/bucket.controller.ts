import { Controller, Get, Param } from '@nestjs/common';
import { Page, Pageable, Pagination } from 'nestjs-pager';
import { Roles } from '../../authentication/decorators/role.decorator';
import { Bucket } from '../entities/bucket.entity';
import { BucketService } from '../services/bucket.service';

@Controller('buckets')
export class BucketController {
  constructor(private readonly service: BucketService) {}

  @Roles("admin")
  @Get(":bucketId")
  public async findById(@Param("bucketId") bucketId: string): Promise<Bucket> {
    return this.service.findById(bucketId);
  }

  @Roles("admin")
  @Get()
  public async findAll(@Pagination() pageable: Pageable): Promise<Page<Bucket>> {
    return this.service.findPage(pageable);
  }

}
