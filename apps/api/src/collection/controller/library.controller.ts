import { Controller, Get } from "@nestjs/common";
import { Pageable } from "@repo/utilities";
import { Authentication } from "../../authentication/decorators/authentication.decorator";
import { User } from "../../user/entities/user.entity";
import { LibraryService } from "../services/library.service";
import { Pagination } from '@repo/nestjs';

@Controller("libraries")
export class LibraryController {

    constructor(private readonly service: LibraryService) { }

    @Get()
    public async findLibraryByUser(@Pagination() pageable: Pageable, @Authentication() authentication: User) {
        return this.service.findPageByUser(authentication, pageable);
    }

}