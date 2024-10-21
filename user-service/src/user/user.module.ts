import { Module } from '@nestjs/common';
import { UserInfoService } from './user-info/user-info.service';
import { ChangeInfoService } from './change-info/change-info.service';
import { UserController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';
import { register } from 'module';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
  JwtModule.registerAsync({
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => ({
      global: true,
      secret: configService.get<string>('SECRET'),
    }),
    inject: [ConfigService],
  })],
  providers: [UserInfoService, ChangeInfoService],
  controllers: [UserController]
})
export class UserModule {}
