import { Controller, Get, Param } from "@nestjs/common";
import { Authentication } from "../../authentication/decorators/authentication.decorator";
import { User } from "../../user/entities/user.entity";
import { ProfileService } from "../services/profile.service";

@Controller("profiles")
export class ProfileController {

    constructor(
        private readonly profileService: ProfileService
    ) {}

    @Get("@me")
    public async findByCurrentUser(@Authentication() authentication: User) {
        return this.profileService.findByCurrentUser(authentication);
    }

    @Get(":userId")
    public async findByUserId(@Param("userId") userId: string) {
        return this.profileService.findByUserId(userId);
    }

}