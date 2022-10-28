import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Page, Pageable, Pagination } from 'nestjs-pager';
import { Roles } from '../../authentication/decorators/role.decorator';
import { ROLE_ADMIN } from '../../constants';
import { CreateResult } from '../../utils/results/creation.result';
import { CreateMountDTO } from '../dtos/create-mount.dto';
import { UpdateMountDTO } from '../dtos/update-mount.dto';
import { Mount } from '../entities/mount.entity';
import { MountService } from '../services/mount.service';

// TODO: Implement artwork mount per bucket.

@Controller('mounts')
export class MountController {
  constructor(private readonly mountService: MountService) {}

  @Roles(ROLE_ADMIN)
  @Get("/bucket/:bucketId")
  public async findAllByBucket(@Param("bucketId") bucketId: string, @Pagination() pageable: Pageable): Promise<Page<Mount>> {
    return this.mountService.findByBucketId(bucketId, pageable);
  }

  @Roles(ROLE_ADMIN)
  @Get(":mountId")
  public async findById(@Param("mountId") mountId: string): Promise<Mount> {
    return this.mountService.findById(mountId);
  }

  @Roles(ROLE_ADMIN)
  @Put(":mountId")
  public async updateMount(@Param("mountId") mountId: string, @Body() updateMountDto: UpdateMountDTO): Promise<Mount> {
    return this.mountService.update(mountId, updateMountDto)
  }

  @Roles(ROLE_ADMIN)
  @Post()
  public async createMount(@Body() createMountDto: CreateMountDTO): Promise<CreateResult<Mount>> {
    return this.mountService.createIfNotExists(createMountDto)
  }

  @Roles(ROLE_ADMIN)
  @Delete(":mountId")
  public async deleteMount(@Param("mountId") mountId: string): Promise<boolean> {
    return this.mountService.delete(mountId)
  }

  @Roles(ROLE_ADMIN)
  @Put(":mountId/default")
  public async setDefaultInBucket(@Param("mountId") mountId: string): Promise<Mount> {
    return this.mountService.setDefaultMount(mountId)
  }

}
