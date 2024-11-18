import {Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/models/user.model';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer';
import { EmailCode } from 'src/models/EmailCode.model';
import { emailTemplate } from 'src/utils/emailTemplate';
import { ChangeDataDto } from 'src/dto/change-data.dto';
import { customResponse } from 'src/utils/customResponse.utils';


@Injectable()
export class ChangeInfoService {
    private s3: AWS.S3;
    private transporter;
    constructor (@InjectModel(User.name) private userModel: Model<User>, @InjectModel(EmailCode.name) private emailCodeModel: Model<EmailCode>){
        AWS.config.update({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: 'ru-central1',
          });

          this.s3 = new AWS.S3({
            endpoint: 'hb.ru-msk.vkcloud-storage.ru',
          });
          this.transporter = nodemailer.createTransport({
            host: 'smtp.mail.ru',
            port: 465,
            secure: true,
            auth: {
                user: 'timealive@mail.ru',
                pass: 'y4Q67HWYyns4ceHHKhZ6',
            },
          });
    }
    async changeAvatar(file: Express.Multer.File,userId:string){

      try {
        const user = await this.userModel.findById(userId);
        if (!user){
          console.log(userId);
          return customResponse('error',"USER_NOT_FOUND");
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

        return customResponse("success","OK",{ url: fileUrl });
      } catch (error) {
        console.error('Error uploading file:', error);
        return customResponse('error',"UNKNOWN_ERROR",error)
      }
    }
    async changePassword(oldPassword: string, newPassword: string, userId:string){
      try {
        if (oldPassword==newPassword){
          return customResponse("error","SAME_PASSWORD");
        }
        const user = await this.userModel.findById(userId);
        const userPassword = user.password;
        const isSame = await bcrypt.compare(oldPassword, userPassword);
        if (isSame){
          user.password=bcrypt.hashSync(newPassword, 7);
          await user.save();
          return customResponse("success","USER_UPDATED")
        }
        else {
          return customResponse("error","INVALID_OLD_PASSWORD")
        }
        } catch (error) {
          return customResponse('error',"UNKNOWN_ERROR",error)
        }
    }
    async sendEmailCode(email:string,userId:string){
      try {
        const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isEmail = reg.test(String(email).toLowerCase());
        if (!isEmail){
            return customResponse("error","NOT_AN_EMAIL");
        }
        const users = await this.userModel.find({ email: email, _id: { $ne: userId } });
        console.log(users,users.length);
        if (users.length!=0){
          return customResponse('error',"EMAIL_TAKEN")
        }
        const codeLength = 6;
        const possibleChars = '0123456789';
        let authCode = '';
        for (let i = 0; i < codeLength; i++) {
          const randomIndex = Math.floor(Math.random() * possibleChars.length);
          authCode += possibleChars.charAt(randomIndex);
        }
        const code = authCode;
        const mailOptions = {
          from: 'timealive@mail.ru',
          to: `${email}`,
          subject: 'Код верификации для HabitsCity',
          text: `Вы получили это сообщение, т.к. на ваш email был запрошен код для авторизации на сайте HabitsCity. Если вы этого не делали, не отвечайте на сообщение. \nКод: ${code} `,
          html: emailTemplate(code)
        };
        const sendMailAsync = (mailOptions:any): Promise<SentMessageInfo> => {
          return new Promise((resolve, reject) => {
            this.transporter.sendMail(mailOptions, (err, info) => {
              if (err) {
                reject(err);
              } else {
                resolve(info);
              }
            });
          });
        };
        const resp = await sendMailAsync(mailOptions);
        if (!resp.response.includes("250 OK")){
          return customResponse('error',"EMAIL_SEND_FAILED")
        }
        await this.emailCodeModel.deleteMany({userId: userId});
        const emailCode = new this.emailCodeModel({
          email:email,
          userId: userId,
          code: code,
          expiresAt: new Date(Date.now()+ 10 * 60 * 1000)
        });
        await emailCode.save();
        return customResponse('success','OK')
        } catch (error) {
          return customResponse('error',"UNKNOWN_ERROR",error)
        }
    }

    async verifyCode(code:string,userId:string){
      try {
        const code_data= await this.emailCodeModel.findOne({code:code,userId:userId});
        if (!code_data){
          return customResponse('error',"INCORRECT_CODE")
        }
        const currentDate=new Date();
        console.log(code_data.expiresAt.getTime(),currentDate.getTime())
        if (code_data.expiresAt.getTime()<currentDate.getTime()){
          return customResponse('error',"CODE_EXPIRED")
        }
        const user = await this.userModel.findOne({_id:userId});
        user.email=code_data.email;
        await user.save();
        return customResponse('success',"OK")
      } catch (error) {
        return customResponse('error',"UNKNOWN_ERROR",error)
      }
    }
    async changeData(changeDataDto:ChangeDataDto,userId:string){
      try {
        const {username,bio} = changeDataDto;
        if (username){
        const usernamePattern =/^[a-zA-Z0-9_]+$/;
          if (!usernamePattern.test(username)){
            return customResponse('error',"USERNAME_INVALID")
          }
          if(username.length<4){
            return customResponse('error',"USERNAME_SHORT")
          }
            const isTaken = await this.userModel.findOne({username: { $eq: username, $ne: null }});
            if (isTaken){
              return customResponse('error',"USERNAME_TAKEN")
            }
            const user = await this.userModel.findOne({_id:userId});
            user.username=username;
            await user.save();
        }
        if (bio){
          const user = await this.userModel.findOne({_id:userId});
          user.bio=bio;
          await user.save();
        }
        return customResponse('success',"OK")
      } catch (error) {
        return customResponse('error',"UNKNOWN_ERROR",error)
      }
    }

}
