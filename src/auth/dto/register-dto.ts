import { IsEmail, IsNotEmpty, IsString, MinLength, } from 'class-validator';

export class RegisterDto {

    @IsNotEmpty()
    @IsString()
    name:string

    @IsNotEmpty()
    @IsEmail()
    @IsString()
    email:string

    @IsNotEmpty()
    @IsString()
    @MinLength(6,{message: "Şifre en az 6 karakter olmalıdır"})
    password:string

    @IsNotEmpty()
    @IsString()
    passwordConfirm:string
}