import { Controller, Get, Headers, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(":userId")
  public async findById(@Param("userId") userId: string, @Headers("Authorization") authHeader: string) {
    // return this.userService.findProfileById(userId, authHeader);
    return null;
  }

}
