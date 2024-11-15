import { IsString} from 'class-validator';

export class ChangeDataDto {
  @IsString()
  newUsername: string;

  @IsString()

  newBio: string;
}
