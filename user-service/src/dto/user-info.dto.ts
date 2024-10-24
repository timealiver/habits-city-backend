import { IsString, IsBoolean, IsEmail, IsOptional, IsArray, IsNotEmpty } from 'class-validator';
import { Expose, Exclude } from 'class-transformer';
@Exclude()
export class UserInfoDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  username?: string;

  @Expose()
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @Expose()
  @IsString()
  @IsOptional()
  phone?: string;

  @Expose()
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  roles?: string[];

  @Expose()
  @IsBoolean()
  @IsNotEmpty()
  isOauth?: boolean;

  @Expose()
  @IsString()
  @IsOptional()
  avatar?: string;
}