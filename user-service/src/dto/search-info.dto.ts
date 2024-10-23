import { IsString,IsOptional,IsNotEmpty } from 'class-validator';
import { Expose, Exclude } from 'class-transformer';
@Exclude()
export class SearchInfoDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  username?: string;

  @Expose()
  avatar?: string;
}