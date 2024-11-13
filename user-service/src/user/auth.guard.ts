import { CanActivate, ExecutionContext, Injectable, UnauthorizedException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.headers.authorization){
      throw new UnauthorizedException('No authorization token');
    }
    const token = request.headers.authorization.split(' ')[1];
    if (!token){
      throw new UnauthorizedException();
    }
    try{
      request.user = this.jwtService.verify(token);
      return true;
    } catch (error){
      console.log(error);
      throw new UnauthorizedException();
    }
  }
}
