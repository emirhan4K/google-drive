import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateSharesDto {
    @IsNotEmpty()
    @IsString()
    fileId:string;

    @IsOptional()
    @IsDateString()
    expiresAt:string;

    @IsOptional()
    @IsNumber()
    maxDownloads:number;
}