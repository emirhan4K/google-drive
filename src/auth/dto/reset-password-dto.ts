import { IsNotEmpty, IsEmail, IsString , MinLength } from "class-validator";

export class ResetPasswordDto {
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email:string

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    code:string

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    newPassword:string

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    newPasswordConfirm:string
}