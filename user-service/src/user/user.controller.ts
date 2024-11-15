import { Controller, Get, UseGuards, Request, Param, Query, UseInterceptors, Post, UploadedFile, Body, BadRequestException, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { UserInfoService } from './user-info/user-info.service';
import { UserInfoDto } from 'src/dto/user-info.dto';
import { SearchInfoDto } from 'src/dto/search-info.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChangeInfoService } from './change-info/change-info.service';
import { ChangePasswordDto } from 'src/dto/change-password.dto';
import { validate } from 'class-validator';
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

@Post("changePassword")
@UseGuards(AuthGuard)
async changePassword(@Request() request, @Body(new ValidationPipe()) changePasswordDto: ChangePasswordDto):Promise<{ status: string }>{
    const userId=request.user.userId;
    const {oldPassword,newPassword} = changePasswordDto;
    if (!oldPassword || !newPassword){
        throw new BadRequestException("Empty field(s)");
    }
    return this.changeInfoService.changePassword(oldPassword,newPassword,userId);
}

@Post("sendEmailCode")
@UseGuards(AuthGuard)
async sendEmailCode(@Request() request, @Body('email') email: string):Promise<{ status: string }>{
    const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = reg.test(String(email).toLowerCase());
    if (!isEmail){
        throw new BadRequestException("Not an email");
    }
    const userId = request.user.userId;
    return this.changeInfoService.sendEmailCode(email,userId);
}

@Post('verifyCode')
@UseGuards(AuthGuard)
async verifyCode(@Request() request, @Body('code') code: string):Promise<{ status: string }>{
    const userId = request.user.userId;
    return this.changeInfoService.verifyCode(code,userId);
}
}
