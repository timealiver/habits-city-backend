import { Controller, Get, UseGuards, Request, Query, UseInterceptors, Post, UploadedFile, Body, ValidationPipe, Delete, Patch } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { UserInfoService } from './user-info/user-info.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChangeInfoService } from './change-info/change-info.service';
import { ChangePasswordDto } from 'src/dto/change-password.dto';
import { ChangeDataDto } from 'src/dto/change-data.dto';
import { LocalizationInterceptor } from './localization.interceptor';
import { ApiResponse } from 'src/interfaces/response.interface';
import { customResponse} from 'src/utils/customResponse.utils';
import { FriendshipService } from './friendship/friendship.service';

@Controller('user')
@UseGuards(AuthGuard)
@UseInterceptors(LocalizationInterceptor)
export class UserController {
    constructor(
        private readonly userInfoService: UserInfoService, 
        private readonly changeInfoService: ChangeInfoService,
        private readonly friendshipService: FriendshipService
    ) {}

@Get("getInfo")
async getInfo(@Request() request):Promise<ApiResponse>{
    const user = request.user.userId;
    return this.userInfoService.getInfo(user);
}

@Get("getUserInfo")
async getUserInfo(@Request() request, @Query('username') username: string ):Promise<ApiResponse>{
    const user = request.user.userId;
    return this.userInfoService.getUserInfo(username, user);
}
@Get("searchUsers")
async getSearchUsers(@Request() request,@Query() query: { username?: string, batch?: number, status?: string }):Promise<ApiResponse>{
    const {username,batch,status} = query;
    const user = request.user.userId;
    return this.userInfoService.getUsersByUsername(username,user,batch,status);
}

@Get("isValidUsername")
async isUsernameTaken(@Query('username') username: string): Promise<ApiResponse>{
    return this.userInfoService.isValidUsername(username);
}

@Post("changeAvatar")
@UseInterceptors(FileInterceptor('avatar'))
async changeAvatar(@UploadedFile() file: Express.Multer.File, @Request() request): Promise<ApiResponse> {
    const userId = request.user.userId;
    return this.changeInfoService.changeAvatar(file, userId);
  }

@Post("changePassword")
async changePassword(@Request() request, @Body(new ValidationPipe()) changePasswordDto: ChangePasswordDto):Promise<ApiResponse>{
    const userId=request.user.userId;
    const {oldPassword,newPassword} = changePasswordDto;
    if (!oldPassword || !newPassword){
        return customResponse("error","EMPTY_FIELDS")
    }
    return this.changeInfoService.changePassword(oldPassword,newPassword,userId);
}

@Post("sendEmailCode")
async sendEmailCode(@Request() request, @Body('email') email: string): Promise<ApiResponse>{
    const userId = request.user.userId;
    return this.changeInfoService.sendEmailCode(email,userId);
}

@Post('verifyCode')
async verifyCode(@Request() request, @Body('code') code: string):Promise<ApiResponse>{
    const userId = request.user.userId;
    return this.changeInfoService.verifyCode(code,userId);
}

@Patch('changeData')
async changeData(@Request() request,@Body() changeDataDto: ChangeDataDto): Promise<ApiResponse>{
    const userId = request.user.userId;
    return this.changeInfoService.changeData(changeDataDto,userId);
}

@Delete('deleteAccount')
async deleteUser(@Request() request){
    const userId = request.user.userId;
    return this.changeInfoService.deleteAccount(userId);
}

@Post('addFriend')
async addFriend(@Request() request, @Body('username') username: string ):Promise<ApiResponse>{
    const userId = request.user.userId;
    return this.friendshipService.addFriend(userId,username);
}
@Post('deleteFriend')
async deleteFriend(@Request() request, @Body('username') username: string ):Promise<ApiResponse>{
    const userId = request.user.userId;
    return this.friendshipService.deleteFriend(userId,username);
}
}
