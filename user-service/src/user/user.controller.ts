import { Controller, Get, UseGuards, Request, Query, UseInterceptors, Post, UploadedFile, Body, ValidationPipe, Delete } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { UserInfoService } from './user-info/user-info.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChangeInfoService } from './change-info/change-info.service';
import { ChangePasswordDto } from 'src/dto/change-password.dto';
import { ChangeDataDto } from 'src/dto/change-data.dto';
import { LocalizationInterceptor } from './localization.interceptor';
import { ApiResponse } from 'src/interfaces/response.interface';
import { customResponse} from 'src/utils/customResponse.utils';
@Controller('user')
@UseInterceptors(LocalizationInterceptor)
export class UserController {
    constructor(
        private readonly userInfoService: UserInfoService, 
        private readonly changeInfoService: ChangeInfoService
    ) {}

@Get("getInfo")
@UseGuards(AuthGuard)
async getInfo(@Request() request):Promise<ApiResponse>{
    const user = request.user.userId;
    return this.userInfoService.getInfo(user);
}
@Get("searchUsers")
@UseGuards(AuthGuard)
async getSearchUsers(@Request() request,@Query('username') username: string):Promise<ApiResponse>{
    const user = request.user.userId;
    return this.userInfoService.getUsersByUsername(username, user);
}

@Get("isTaken")
@UseGuards(AuthGuard)
async isUsernameTaken(@Query('username') username: string): Promise<ApiResponse>{
    return this.userInfoService.isUsernameTaken(username);
}

@Post("changeAvatar")
@UseGuards(AuthGuard)
@UseInterceptors(FileInterceptor('avatar'))
async changeAvatar(@UploadedFile() file: Express.Multer.File, @Request() request): Promise<ApiResponse> {
    const userId = request.user.userId;
    return this.changeInfoService.changeAvatar(file, userId);
  }

@Post("changePassword")
@UseGuards(AuthGuard)
async changePassword(@Request() request, @Body(new ValidationPipe()) changePasswordDto: ChangePasswordDto):Promise<ApiResponse>{
    const userId=request.user.userId;
    const {oldPassword,newPassword} = changePasswordDto;
    if (!oldPassword || !newPassword){
        return customResponse("error","EMPTY_FIELDS")
    }
    return this.changeInfoService.changePassword(oldPassword,newPassword,userId);
}

@Post("sendEmailCode")
@UseGuards(AuthGuard)
async sendEmailCode(@Request() request, @Body('email') email: string): Promise<ApiResponse>{
    const userId = request.user.userId;
    return this.changeInfoService.sendEmailCode(email,userId);
}

@Post('verifyCode')
@UseGuards(AuthGuard)
async verifyCode(@Request() request, @Body('code') code: string):Promise<ApiResponse>{
    const userId = request.user.userId;
    return this.changeInfoService.verifyCode(code,userId);
}

@Post('changeData')
@UseGuards(AuthGuard)
async changeData(@Request() request,@Body() changeDataDto: ChangeDataDto): Promise<ApiResponse>{
    const userId = request.user.userId;
    return this.changeInfoService.changeData(changeDataDto,userId);
}

@Delete('deleteAccount')
@UseGuards(AuthGuard)
async deleteUser(@Request() request){
    const userId = request.user.userId;
    return this.changeInfoService.deleteAccount(userId);
}
}
