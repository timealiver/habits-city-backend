import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Friend } from "src/models/friend.model";
import { User } from "src/models/user.model";
import { customResponse } from "src/utils/customResponse.utils";

@Injectable()
export class FriendshipService {
    constructor (
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Friend.name) private friendModel: Model<Friend>){}
    async addFriend(userId:string,username:string){
        try {
        const friend = await this.userModel.findOne({username:username});
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
            return customResponse("success","FRIEND_REQ_SENT");
        } else if (isRelated.status=="FRIENDS"){
            return customResponse("error","ALREADY_FRIEND");
        } else if (isRelated.userId==userId && isRelated.status=="FOLLOWING"){
            return customResponse("error","ALREADY_SENT");
        } else if (isRelated.userId==friend._id && isRelated.status=="FOLLOWING"){
            isRelated.status="FRIENDS";
            isRelated.updatedAt=new Date(Date.now());
            await isRelated.save();
            return customResponse("success","BECAME_FRIENDS");
        }


        } catch (error) {
            return customResponse("error","UNKNOWN_ERROR",{error: error.toString()});
        }
    }
}