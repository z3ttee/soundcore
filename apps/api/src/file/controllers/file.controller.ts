import { Controller, Get, Param } from "@nestjs/common";
import { Page, Pageable, Pagination } from "nestjs-pager";
import { Roles } from "../../authentication/decorators/role.decorator";
import { ROLE_ADMIN } from "../../constants";
import { File } from "../entities/file.entity";
import { FileService } from "../services/file.service";

@Controller("files")
export class FileController {

    constructor(private readonly service: FileService) {}

    @Roles(ROLE_ADMIN)
    @Get("mount/:mountId")
    public async findByMountId(@Param("mountId") mountId: string, @Pagination() pageable: Pageable): Promise<Page<File>> {
        return this.service.findByMount(mountId, pageable);
    }

}