import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateFolderDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
