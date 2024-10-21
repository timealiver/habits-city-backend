import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { UserInfoService } from './user-info/user-info.service';
import { UserInfoDto } from 'src/dto/user-info.dto';
@Controller('user')
export class UserController {
    constructor(private readonly userInfoService: UserInfoService) {}

@Get()
@UseGuards(AuthGuard)
async getInfo(@Request() request):Promise<UserInfoDto>{
    const user = request.user.userId;
    return this.userInfoService.getInfo(user);
}


}
