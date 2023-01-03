import { Controller, Get } from "@nestjs/common";
import { Pageable, Pagination } from "nestjs-pager";
import { Authentication } from "../../authentication/decorators/authentication.decorator";
import { User } from "../../user/entities/user.entity";
import { LibraryService } from "../services/library.service";

@Controller("libraries")
export class LibraryController {

    constructor(private readonly service: LibraryService) {}

    @Get()
    public async findLibraryByUser(@Pagination() pageable: Pageable, @Authentication() authentication: User) {
        return this.service.findPageByUser(authentication, pageable);
    }

}