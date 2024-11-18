import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';
import { SearchInfoDto } from 'src/dto/search-info.dto';
import { UserInfoDto } from 'src/dto/user-info.dto';
import { ApiResponse } from 'src/interfaces/response.interface';
import { User } from 'src/models/user.model';
import { customResponse } from 'src/utils/customResponse.utils';

@Injectable()
export class UserInfoService {
    constructor (@InjectModel(User.name) private userModel: Model<User>){}
    async getInfo(userId: string):Promise<ApiResponse>{
        try {
            const user = await this.userModel.findOne({_id: userId});
            console.log(user, userId);
            const data = plainToInstance(UserInfoDto,user,{excludeExtraneousValues: true}); 
            user.googleId!=null?data.isGoogle=true:data.isGoogle=false;
            user.yandexId!=null?data.isYandex=true:data.isYandex=false;
            data.rating=String(Math.floor(Number(data.rating)*Math.random()*10))
            return customResponse('success','DONE',data);
        } catch (error) {
            return customResponse('error',"UNKNOWN_ERROR",error);
        }
    }
    async getUsersByUsername(username: string):Promise<ApiResponse>{
        try {
            const regex = new RegExp(`^${username}`, 'i');
            const users = await this.userModel.find({username: regex});
            const data = plainToInstance(SearchInfoDto,users,{excludeExtraneousValues: true});
            return customResponse('success','DONE',data);
        } catch (error) {
            return customResponse('error',"UNKNOWN_ERROR",error);
        }
    }
    async isUsernameTaken(username: string):Promise<ApiResponse> {
        try {
            const user = await this.userModel.findOne({username: { $eq: username, $ne: null }});
            if (!user){
                return customResponse('success','DONE',{isTaken:false});
            }
            return customResponse('success','DONE',{isTaken:true});
        } catch (error) {
            return customResponse('error',"UNKNOWN_ERROR",error);
        }
    }

} 
