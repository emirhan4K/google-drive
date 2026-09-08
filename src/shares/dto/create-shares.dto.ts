import {
    IsArray,
    IsBoolean,
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreateSharesDto {
  @IsNotEmpty()
  @IsMongoId()
  fileId: string;

  @IsOptional()
  @IsDateString()
  expiresAt: string;

  @IsOptional()
  @IsNumber()
  maxDownloads: number;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true }) //Dizinin içindeki her bir elemanın gerçekten geçerli bir MongoDB ID'si olup olmadığını tek tek kontrol eder
  allowedUsers?: string[];
}
