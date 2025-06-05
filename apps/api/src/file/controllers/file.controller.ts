import { Controller, Get, Param } from "@nestjs/common";
import { Pagination } from "@repo/nestjs";
import { Page, Pageable } from "@repo/utilities";
import { File } from "../entities/file.entity";
import { FileService } from "../services/file.service";

@Controller("files")
export class FileController {
  constructor(private readonly service: FileService) {}

  @Get("mount/:mountId")
  public async findByMountId(@Param("mountId") mountId: string, @Pagination() pageable: Pageable): Promise<Page<File>> {
    return this.service.findByMount(mountId, pageable);
  }
}
