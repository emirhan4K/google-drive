import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdatePrivacyDto {
  @IsNotEmpty()
  @IsBoolean()
  isPublic: boolean;
}