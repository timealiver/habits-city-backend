import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization.split(' ')[1];
    console.log(token);
    if (!token){
      throw new UnauthorizedException();
    }
    try{
      request.user = this.jwtService.verify(token);
      console.log(request.user);
    } catch (error){
      console.log(error);
      throw new UnauthorizedException();
    }
    return false;
  }
}
