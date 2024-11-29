import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Friend } from "src/models/friend.model";
import { User } from "src/models/user.model";
import { UserStats } from "src/models/userStats.model";
import { customResponse } from "src/utils/customResponse.utils";

@Injectable()
export class FriendshipService {
    constructor (
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Friend.name) private friendModel: Model<Friend>,
        @InjectModel(UserStats.name) private userStatsModel: Model<UserStats>){}
    async addFriend(userId:string,username:string){
        try {
        const friend = await this.userModel.findOne({username:username});
        if (!friend){
            return customResponse('error',"USER_NOT_FOUND",null)
        } 
        const isRelated = await this.friendModel.findOne({$or:[{$and:[{userId:userId},{friendId:friend._id}]},{$and:[{userId:friend._id},{friendId:userId}]}]})
        if (!isRelated){
            const friendship = new this.friendModel({
                userId:userId,
                friendId:friend._id,
                status: "FOLLOWING",
                createdAt: Date.now(),
                updatedAt: Date.now()
            })
            await friendship.save();
            await this.updateAmounts(userId);
            await this.updateAmounts(String(friend._id));
            return customResponse("success","FRIEND_REQ_SENT");
        } else if (isRelated.status=="FRIENDS"){
            return customResponse("error","ALREADY_FRIEND");
        } else if ((isRelated.userId==userId && isRelated.status=="FOLLOWING") || (isRelated.friendId==userId && isRelated.status=="FOLLOWED")){ //ДОБАВИТЬ FOLLOWED
            return customResponse("error","ALREADY_SENT");
        } else if ((isRelated.userId==friend._id && isRelated.status=="FOLLOWING")){ //ДОБАВИТЬ FOLLOWED
            isRelated.status="FRIENDS";
            isRelated.updatedAt=new Date(Date.now());
            await isRelated.save();
            await this.updateAmounts(userId);
            await this.updateAmounts(String(friend._id));
            return customResponse("success","BECAME_FRIENDS");
        } else if(isRelated.friendId==friend._id && isRelated.status=="FOLLOWED"){
            isRelated.status="FRIENDS";
            isRelated.updatedAt=new Date(Date.now());
            await isRelated.save();
            await this.updateAmounts(userId);
            await this.updateAmounts(String(friend._id));
            return customResponse("success","BECAME_FRIENDS");
        }
        } catch (error) {
            return customResponse("error","UNKNOWN_ERROR",{error: error.toString()});
        }
    }
    async deleteFriend(userId:string, username: string){
        try {
        const friend = await this.userModel.findOne({username:username});
        if (!friend){
            return customResponse('error',"USER_NOT_FOUND",null)
        } 
        const isRelated = await this.friendModel.findOne({$or:[{$and:[{userId:userId},{friendId:friend._id}]},{$and:[{userId:friend._id},{friendId:userId}]}]})
        if (!isRelated){
            return customResponse("error","NOT_SUB")
        } else if ((isRelated.userId==userId && isRelated.status=="FOLLOWING")|| (isRelated.friendId==userId && isRelated.status=="FOLLOWED")){
            await isRelated.deleteOne();
            await this.updateAmounts(userId);
            await this.updateAmounts(String(friend._id));
            return customResponse("success","UNSUBSCRIBED")
        } else if ((isRelated.status =="FRIENDS" && isRelated.userId==userId)){
            isRelated.status="FOLLOWED";
            isRelated.updatedAt=new Date(Date.now());
            await isRelated.save();
            await this.updateAmounts(userId);
            await this.updateAmounts(String(friend._id));
            return customResponse("success","UNSUBSCRIBED")
        } else if((isRelated.status =="FRIENDS" && isRelated.friendId==userId)){
            isRelated.status="FOLLOWING";
            isRelated.updatedAt=new Date(Date.now());
            await isRelated.save();
            await this.updateAmounts(userId);
            await this.updateAmounts(String(friend._id));
            return customResponse("success","UNSUBSCRIBED")
        }
            return customResponse("error","UNKNOWN_ERROR",{error: "С каждым из нас явно что-то не так"})
        } catch (error) {
            return customResponse("error","UNKNOWN_ERROR",{error: error.toString()})
        }
    }
   
  private async updateAmounts(userId:string){
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const stats = await this.userStatsModel.findOne({ userId: userId, date: today });
    const followingAmount = (await this.friendModel.find({$or:[{ userId: userId, status: 'FOLLOWING' },{ friendId: userId, status: 'FOLLOWED' }]})).length;
    const followersAmount = (await this.friendModel.find({$or:[{ userId: userId, status: 'FOLLOWED' },{ friendId: userId, status: 'FOLLOWING' }]})).length;
    const friendsAmount = (await this.friendModel.find({$and:[{$or:[{userId:userId},{friendId:userId}]},{status:"FRIENDS"}]})).length;
    if (stats) {
        stats.followersAmount = followersAmount;
        stats.followingAmount = followingAmount;
        stats.friendsAmount = friendsAmount;
        await stats.save();
      } else {
        const newStats = new this.userStatsModel({
          userId: userId,
          date: today,
          followersAmount: followersAmount,
          followingAmount: followingAmount,
          friendsAmount: friendsAmount,
        });
        await newStats.save();
      }
    }
    catch(error){
        console.log(error.toString());
        throw (error);
    }
    }
}
