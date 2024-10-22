import { Controller, Get, UseGuards, Request, Param, Query } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { UserInfoService } from './user-info/user-info.service';
import { UserInfoDto } from 'src/dto/user-info.dto';
import { SearchInfoDto } from 'src/dto/search-info.dto';
@Controller('user')
export class UserController {
    constructor(private readonly userInfoService: UserInfoService) {}

@Get("getInfo")
@UseGuards(AuthGuard)
async getInfo(@Request() request):Promise<UserInfoDto>{
    const user = request.user.userId;
    return this.userInfoService.getInfo(user);
}

@Get("searchUsers")
@UseGuards(AuthGuard)
async getSearchUsers(@Query('username') username: string):Promise<SearchInfoDto[]>{
    return this.userInfoService.getUsersByUsername(username);
}

@Get("isTaken")
@UseGuards(AuthGuard)
async isUsernameTaken(@Query('username') username: string): Promise<boolean>{
    console.log("U: ",username);
    return this.userInfoService.isUsernameTaken(username);
}


}
