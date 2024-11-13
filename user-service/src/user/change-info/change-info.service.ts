import { HttpException, HttpStatus, Injectable, Post, UseInterceptors } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/models/user.model';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChangeInfoService {
    private s3: AWS.S3;
    constructor (@InjectModel(User.name) private userModel: Model<User>){
        AWS.config.update({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: 'ru-central1', 
          });
      
          this.s3 = new AWS.S3({
            endpoint: 'hb.ru-msk.vkcloud-storage.ru', 
          });
    }
    async changeAvatar(file: Express.Multer.File,userId:string,){

      try {
        const user = await this.userModel.findById(userId);
        if (!user){
          console.log(userId);
          throw Error('User not found');
        }
        const key = `avatars/${uuidv4()}`;
  
        await this.s3.putObject({
          Body: file.buffer,
          Bucket: 'users-photo',
          Key: key,
          ContentType: file.mimetype,
          ACL: 'public-read'
        }).promise();
  
        const fileUrl = `https://hb.ru-msk.vkcloud-storage.ru/users-photo/${key}`;
  
        // Обновите информацию о пользователе в базе данных
        if (user.avatar!=null){
          const key = user.avatar.split('/')[5];
          await this.s3.deleteObject({
            Bucket: 'users-photo',
            Key: 'avatars/'+key,
          }).promise();
        }
        user.avatar = fileUrl;
        await user.save();
  
        return { url: fileUrl };
      } catch (error) {
        console.error('Error uploading file:', error);
        throw new HttpException(`Error occured: ${error}`, HttpStatus.BAD_REQUEST);
      }
    }
    async changePassword(oldPassword: string, newPassword: string, userId:string){
      try {
      if (oldPassword==newPassword){
        throw new HttpException('Passwords are the same', HttpStatus.BAD_REQUEST);
      }
      const user = await this.userModel.findById(userId);
      const userPassword = user.password;
      const isSame = await bcrypt.compare(oldPassword, userPassword);
      if (isSame){
        user.password=bcrypt.hashSync(newPassword, 7);
        user.save();
        return {status: "OK"}
      }
      else {
        throw new HttpException('Invalid old password', HttpStatus.BAD_REQUEST);
      }
      } catch (error) {
        if (error instanceof HttpException){
          throw error;
        }
        throw new HttpException(`${error}`, HttpStatus.BAD_REQUEST);  
      }
      
    }
}
