import { Module } from '@nestjs/common';
import { UserInfoService } from './user-info/user-info.service';
import { ChangeInfoService } from './change-info/change-info.service';
import { UserController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/models/user.model';
import { EmailCode, EmailCodeSchema } from 'src/models/EmailCode.model';
import { FriendshipService } from './friendship/friendship.service';
import { Friend, FriendSchema } from 'src/models/friend.model';
import { UserStats, UserStatsSchema } from 'src/models/userStats.model';

@Module({
  imports: [
  JwtModule.registerAsync({
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => ({
      global: true,
      secret: configService.get<string>('SECRET'),
    }),
    inject: [ConfigService],
  }),
  MongooseModule.forFeature([{ name: User.name, schema: UserSchema },
    { name: EmailCode.name, schema: EmailCodeSchema },
    { name: Friend.name, schema: FriendSchema },
    { name: UserStats.name, schema: UserStatsSchema }
  ])],
  providers: [UserInfoService, ChangeInfoService, FriendshipService],
  controllers: [UserController]
})
export class UserModule {}
