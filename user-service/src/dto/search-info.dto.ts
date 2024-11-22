import { IsString,IsOptional,IsNotEmpty } from 'class-validator';
import { Expose, Exclude } from 'class-transformer';
import { FriendStatus } from './friends.enum';
@Exclude()
export class SearchInfoDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  username?: string;

  @Expose()
  avatar?: string;

  @Expose()
  rating?: number;

  @Expose()
  bio?: string;

  @Expose()
  createdAt?: Date;

  @Expose()
  isFriend: FriendStatus;
}