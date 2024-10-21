import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';
import { UserInfoDto } from 'src/dto/user-info.dto';
import { User } from 'src/models/user.model';

@Injectable()
export class UserInfoService { 
    constructor (@InjectModel(User.name) private userModel: Model<User>){}
    async getInfo(userId: string){
        const user = await this.userModel.findOne({_id: userId});
        console.log(user, userId);
        return plainToInstance(UserInfoDto,user,{excludeExtraneousValues: true});
    }
}
