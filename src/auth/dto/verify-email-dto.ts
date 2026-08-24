import { IsNotEmpty, IsEmail, IsString, MinLength } from "class-validator";

export class VerifyEmailDto {
    @IsNotEmpty()
    @IsEmail()
    @IsString()
    email: string

    @IsNotEmpty()
    @MinLength(6)
    @IsString()
    code: string
}