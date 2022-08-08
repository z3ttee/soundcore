import { Controller, Get } from "@nestjs/common";
import { Authentication } from "../../authentication/decorators/authentication.decorator";
import { User } from "../../user/entities/user.entity";
import { CollectionService } from "../services/collection.service";

@Controller("collections")
export class CollectionController {

    constructor(private collectionService: CollectionService) {}

    @Get()
    public async findByCurrentUser(@Authentication() user: User) {
        return this.collectionService.findByUserId(user?.id)
    }

}