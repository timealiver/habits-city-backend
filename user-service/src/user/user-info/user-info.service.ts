import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';
import { SearchInfoDto } from 'src/dto/search-info.dto';
import { UserInfoDto } from 'src/dto/user-info.dto';
import { User } from 'src/models/user.model';

@Injectable()
export class UserInfoService {
    constructor (@InjectModel(User.name) private userModel: Model<User>){}
    async getInfo(userId: string){
        try {
            const user = await this.userModel.findOne({_id: userId});
            console.log(user, userId);
            const data = plainToInstance(UserInfoDto,user,{excludeExtraneousValues: true}); 
            user.googleId!=null?data.isGoogle=true:data.isGoogle=false;
            user.yandexId!=null?data.isYandex=true:data.isYandex=false;
            return data;
        } catch (error) {
            throw new HttpException(`Error occured: ${error}`, HttpStatus.BAD_REQUEST);
        }
    }
    async getUsersByUsername(username: string){
        try {
            const regex = new RegExp(`^${username}`, 'i');
            const users = await this.userModel.find({username: regex});
            return plainToInstance(SearchInfoDto,users,{excludeExtraneousValues: true})  
        } catch (error) {
            throw new HttpException(`Error occured: ${error}`, HttpStatus.BAD_REQUEST);
        }
    }
    async isUsernameTaken(username: string): Promise<boolean> {
        try {
            const user = await this.userModel.findOne({username: { $eq: username, $ne: null }});
            if (!user){
                return false;
            }
            return true;
        } catch (error) {
            throw new HttpException(`Error occured: ${error}`, HttpStatus.BAD_REQUEST);
        }
    }

} 
