import { Controller, Get, UseGuards, Request, Param, Query, UseInterceptors, Post, UploadedFile, Body } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { UserInfoService } from './user-info/user-info.service';
import { UserInfoDto } from 'src/dto/user-info.dto';
import { SearchInfoDto } from 'src/dto/search-info.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChangeInfoService } from './change-info/change-info.service';
@Controller('user')
export class UserController {
    constructor(
        private readonly userInfoService: UserInfoService, 
        private readonly changeInfoService: ChangeInfoService
    ) {}

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
    return this.userInfoService.isUsernameTaken(username);
}

@Post("changeAvatar")
@UseGuards(AuthGuard)
@UseInterceptors(FileInterceptor('avatar'))
async changeAvatar(@UploadedFile() file: Express.Multer.File, @Request() request) {
    const userId = request.user.userId;
    return this.changeInfoService.changeAvatar(file, userId);
  }


}
