import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';
import { FriendStatus } from 'src/dto/friends.enum';
import { SearchInfoDto } from 'src/dto/search-info.dto';
import { UserInfoDto } from 'src/dto/user-info.dto';
import { ApiResponse } from 'src/interfaces/response.interface';
import { Friend } from 'src/models/friend.model';
import { User } from 'src/models/user.model';
import { customResponse } from 'src/utils/customResponse.utils';

@Injectable()
export class UserInfoService {
    constructor (@InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Friend.name) private friendModel: Model<Friend>){}
    async getInfo(userId: string):Promise<ApiResponse>{
        try {
            const user = await this.userModel.findOne({_id: userId});
            console.log(user, userId);
            const data = plainToInstance(UserInfoDto,user,{excludeExtraneousValues: true}); 
            user.googleId!=null?data.isGoogle=true:data.isGoogle=false;
            user.yandexId!=null?data.isYandex=true:data.isYandex=false;
            data.rating=String(Math.floor(Number(data.rating)*Math.random()*10))
            data.friendsAmount=(await (this.friendModel.find({$and:[{$or:[{userId:userId},{friendId:userId}]},{status:"FRIENDS"}]}))).length;;
            return customResponse('success','OK',data);
        } catch (error) {
            return customResponse('error',"UNKNOWN_ERROR",error);
        }
    }
    async getUsersByUsername(username?: string, userId?: string, batch?: number, status?: string): Promise<ApiResponse> {
        try {
            const limit = 20;
            const skip = batch ? batch * limit : 0;
    
            let query: any = {
                _id: { $ne: userId }
            };
    
            if (username) {
                const regex = new RegExp(`^${username}`, 'i');
                query.username = regex;
            }
    
            let users = await this.userModel.find(query).skip(skip).limit(limit);
    
    
            let data = users.map(user => {
                const friendStatus = this.getRandomFriendStatus();
                const rating = String(Math.floor(Math.random() * 100));
                return plainToInstance(SearchInfoDto, { ...user.toObject(), isFriend: friendStatus, rating: rating }, { excludeExtraneousValues: true });
            });
            if (status) {
                data = data.filter(user => user.isFriend === status);
            }
    
            return customResponse('success', 'OK', data);
        } catch (error) {
            return customResponse('error', "UNKNOWN_ERROR", error);
        }
    }
    async isValidUsername(username: string):Promise<ApiResponse> {
        try {
            if (!username || username.length<4){
                return customResponse('error',"USERNAME_SHORT")
            }
            const usernamePattern =/^[a-zA-Z0-9_]+$/;
            if (!usernamePattern.test(username)){
              return customResponse('error',"USERNAME_INVALID")
            }
            const user = await this.userModel.findOne({username: { $eq: username, $ne: null }});
            if (user){
                return customResponse('error','USERNAME_TAKEN');
            }
            return customResponse('success','USERNAME_GOOD',);
        } catch (error) {
            return customResponse('error',"UNKNOWN_ERROR",{error: error.toString()});
        }
    }
    async getUserInfo(username: string, userId: string):Promise<ApiResponse>{
        try {
            const user = await this.userModel.findOne({
                username: username, 
            });
            if (!user){
                return customResponse('error',"USER_NOT_FOUND",null)
            }
            const friendStatus = this.getRandomFriendStatus();
            const rating=String(Math.floor(Math.random()*100))
            const data = plainToInstance(SearchInfoDto, { ...user.toObject(), isFriend: friendStatus, rating: rating }, { excludeExtraneousValues: true });
            return customResponse('success','OK',data);
        } catch (error) {
            return customResponse('error',"UNKNOWN_ERROR",error);
        }
    }
    private getRandomFriendStatus(): FriendStatus {
        const values = Object.values(FriendStatus);
        const randomIndex = Math.floor(Math.random() * values.length);
        return values[randomIndex];
    }
} 
