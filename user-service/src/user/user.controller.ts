import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { UserInfoService } from './user-info/user-info.service';

@Controller('user')
export class UserController {
    constructor(private readonly userInfoService: UserInfoService) {}

@Get()
@UseGuards(AuthGuard)
getInfo(): Promise<string>{
    return this.userInfoService.getInfo();
}


}
