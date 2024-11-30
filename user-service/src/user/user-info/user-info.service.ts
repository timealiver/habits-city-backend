import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import mongoose, { Model } from 'mongoose';
import { FriendStatus } from 'src/dto/friends.enum';
import { SearchInfoDto } from 'src/dto/search-info.dto';
import { UserInfoDto } from 'src/dto/user-info.dto';
import { ApiResponse } from 'src/interfaces/response.interface';
import { Friend } from 'src/models/friend.model';
import { User } from 'src/models/user.model';
import { customResponse } from 'src/utils/customResponse.utils';
import { FriendshipService } from '../friendship/friendship.service';

@Injectable()
export class UserInfoService {
    constructor (private readonly friendshipService: FriendshipService,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Friend.name) private friendModel: Model<Friend>){}
    async getInfo(userId: string,locale:string):Promise<ApiResponse>{
        try {
            const user = await this.userModel.findOne({_id: userId});
            console.log(user, userId);
            const data = plainToInstance(UserInfoDto,user,{excludeExtraneousValues: true}); 
            user.googleId!=null?data.isGoogle=true:data.isGoogle=false;
            user.yandexId!=null?data.isYandex=true:data.isYandex=false;
            data.rating=String(Math.floor(Number(data.rating)*Math.random()*10))
            data.friendsAmount=(await (this.friendModel.find({$and:[{$or:[{userId:userId},{friendId:userId}]},{status:"FRIENDS"}]}))).length;;
            data.stats=await this.friendshipService.getFriendStat(user.username,locale);
            data.refLink='https://molsrg-habits-city-frontend-ab3a.twc1.net/?referralId=49248930203&сode=1919218382'
            return customResponse('success','OK',data);
        } catch (error) {
            return customResponse('error',"UNKNOWN_ERROR",error);
        }
    }
    async getUsersByUsername(username?: string, userId?: string, batch?: number, status?: string): Promise<ApiResponse> {
        try {
          const limit = 20;
          const skip = batch ? batch * limit : 0;
    
          if (status) {
            let friendStatuses;
            if (status==="FOLLOWING"){
                friendStatuses = await this.friendModel.find({
                    $or: [
                      { userId: userId, status: status },
                      { friendId: userId, status: "FOLLOWED" }
                    ]
                  })
            } else if(status==="FOLLOWED"){
                friendStatuses = await this.friendModel.find({
                    $or: [
                      { userId: userId, status: status },
                      { friendId: userId, status: "FOLLOWING" }
                    ]
                  })
            } else if(status==='NOT_FOLLOWING'){
                const connectedUserIds = await this.friendModel.find({
                    $or: [
                      { userId: userId },
                      { friendId: userId }
                    ]
                  }).distinct('userId').exec();
          
                  const connectedFriendIds = await this.friendModel.find({
                    $or: [
                      { userId: userId },
                      { friendId: userId }
                    ]
                  }).distinct('friendId').exec();
          
                  const allConnectedIds = new Set([...connectedUserIds, ...connectedFriendIds, userId]);
          
                  const query: any = {
                    _id: { $nin: Array.from(allConnectedIds) }
                  };
          
                  if (username) {
                    const regex = new RegExp(`^${username}`, 'i');
                    query.username = regex;
                  }
          
                  const users = await this.userModel.find(query).skip(skip).limit(limit);
          
                  let data = users.map(user => {
                    const friendStatus = status; // Если статус не найден, считаем, что это не друг
                    const rating = String(Math.floor(Math.random() * 100));
                    return plainToInstance(SearchInfoDto, { ...user.toObject(), isFriend: friendStatus, rating: rating }, { excludeExtraneousValues: true });
                  });
          
                  return customResponse('success', 'OK', data);
                }
            else {
                friendStatuses = await this.friendModel.find({
                    $or: [
                      { userId: userId, status: status },
                      { friendId: userId, status: status }
                    ]
                  });  
            }
            const friendIds = friendStatuses.map(friend => friend.userId === userId ? friend.friendId : friend.userId);
            const query: any = {
                _id: { $in: friendIds }
              };
      
              if (username) {
                const regex = new RegExp(`^${username}`, 'i');
                query.username = regex;
              }
            const users = await this.userModel.find(query).skip(skip).limit(limit);
            let data = users.map(user => {
              const friendStatus = status ; 
              const rating = String(Math.floor(Math.random() * 100));
              return plainToInstance(SearchInfoDto, { ...user.toObject(), isFriend: friendStatus, rating: rating }, { excludeExtraneousValues: true });
            });
    
            return customResponse('success', 'OK', data);
          } else {
            // Логика для случая, когда status не указан
            let query: any = {
              _id: { $ne: userId }
            };
    
            if (username) {
              const regex = new RegExp(`^${username}`, 'i');
              query.username = regex;
            }
    
            let users = await this.userModel.find(query).skip(skip).limit(limit);
    
            // Получаем статусы дружбы для всех найденных пользователей
            const userIds = users.map(user => user._id.toString());
            const friendStatuses = await this.friendModel.find({
              $or: [
                { userId: userId, friendId: { $in: userIds } },
                { userId: { $in: userIds }, friendId: userId }
              ]
            });
    
            // Преобразуем статусы дружбы в объект для быстрого доступа
            const friendStatusMap: { [key: string]: string } = friendStatuses.reduce((map, friend) => {
              if (friend.userId === userId) {
                map[friend.friendId.toString()] = friend.status;
              } else {
                map[friend.userId.toString()] = friend.status;
              }
              return map;
            }, {});
    
            let data = users.map(user => {
              const friendStatus = friendStatusMap[user._id.toString()] || 'NOT_FOLLOWING'; // Если статус не найден, считаем, что это не друг
              const rating = String(Math.floor(Math.random() * 100));
              return plainToInstance(SearchInfoDto, { ...user.toObject(), isFriend: friendStatus, rating: rating }, { excludeExtraneousValues: true });
            });
    
            return customResponse('success', 'OK', data);
          }
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
