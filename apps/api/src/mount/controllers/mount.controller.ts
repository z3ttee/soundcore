import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { Environment } from "@repo/bootstrap";
import { Pagination } from "@repo/nestjs";
import { Pageable } from "@repo/utilities";
import { CreateResult } from "../../utils/results/creation.result";
import { CreateMountDTO } from "../dtos/create-mount.dto";
import { UpdateMountDTO } from "../dtos/update-mount.dto";
import { Mount } from "../entities/mount.entity";
import { MountService } from "../services/mount.service";

@Controller("mounts")
export class MountController {
  constructor(private readonly mountService: MountService) {}

  @Get("/bucket/:bucketId")
  public async findAllByBucket(@Param("bucketId") bucketId: string, @Pagination() pageable: Pageable) {
    return this.mountService.findByBucketId(bucketId, pageable);
  }

  @Get(":mountId")
  public async findById(@Param("mountId") mountId: string): Promise<Mount> {
    return this.mountService.findById(mountId);
  }

  @Put(":mountId")
  public async updateMount(@Param("mountId") mountId: string, @Body() updateMountDto: UpdateMountDTO): Promise<Mount> {
    return this.mountService.update(mountId, updateMountDto);
  }

  @Post()
  public async createMount(@Body() createMountDto: CreateMountDTO): Promise<CreateResult<Mount>> {
    if (Environment.isDockerized) {
      throw new BadRequestException("Application is dockerized, please mount a docker volume into / instead.");
    }

    return this.mountService.createIfNotExists(createMountDto);
  }

  @Delete(":mountId")
  public async deleteMount(@Param("mountId") mountId: string): Promise<boolean> {
    return this.mountService.delete(mountId);
  }

  @Put(":mountId/default")
  public async setDefaultInBucket(@Param("mountId") mountId: string): Promise<Mount> {
    return this.mountService.setDefaultMount(mountId);
  }

  @Get(":mountId/rescan")
  public async reindexMount(@Param("mountId") mountId: string) {
    return this.mountService.rescanMount(mountId);
  }
}
