import { IsString} from 'class-validator';

export class ChangeDataDto {
  @IsString()
  username: string;

  @IsString()
  bio: string;
}
