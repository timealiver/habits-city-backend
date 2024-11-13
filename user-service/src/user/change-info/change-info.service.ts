import { HttpException, HttpStatus, Injectable, Post, UseInterceptors } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/models/user.model';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { EmailCode } from 'src/models/EmailCode.model';

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
          await user.save();
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
    async sendEmailCode(email:string,userId:string){
      try {
        const users = await this.userModel.find({ email: email, _id: { $ne: userId } });
        console.log(users,users.length);
        if (users.length!=0){
        throw new HttpException("This email is already in use by another account.",HttpStatus.BAD_REQUEST)
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
        };  
        const resp = await this.transporter.sendMail(mailOptions,(err, info) => {
          console.log(err, info);
        });
        console.log(await resp);
        if (!resp.response.contains("250 OK")){
          throw new HttpException("Error while sending code. Try again later.",HttpStatus.BAD_REQUEST);
        }
        await this.emailCodeModel.deleteMany({userId: userId});
        const emailCode = new this.emailCodeModel({
         //add email to emailCode model and here
          userId: userId,
          code: code,
          expiresAt: new Date(Date.now()+ 10 * 60 * 1000)
        });
        await emailCode.save();
        return {status:"OK"};
        } catch (error) {
          if (error instanceof HttpException){
            throw error;
          }
          throw new HttpException(error,HttpStatus.BAD_REQUEST);
        }
    }
    
    async verifyCode(code:string,userId:string){
      //findOne AuthCode by code && userId
      //check if code isExpired while verify
      //if found ->change Email to email from AuthCode
      //if not found -> say that this code is incorrect
    }

}
