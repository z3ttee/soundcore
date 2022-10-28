import { Injectable } from '@nestjs/common';
import { User } from '../../user/entities/user.entity';
import { UserService } from '../../user/user.service';

@Injectable()
export class ProfileService {

    constructor(
        private readonly userService: UserService
    ) {}

    public async findByCurrentUser(authentication: User): Promise<User> {
        return this.findByUserId(authentication.id);
    }

    public async findByUserId(userId: string): Promise<User> {
        const result = await this.userService.repository.createQueryBuilder("profile")
            .loadRelationCountAndMap("profile.playlistCount", "profile.playlists")
            .where("profile.id = :userId OR profile.slug = :userId", { userId })
            .getOne();

        return result;
    }

}
