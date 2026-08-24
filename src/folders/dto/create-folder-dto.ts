import { IsNotEmpty, IsString,IsMongoId, IsOptional } from "class-validator";

export class CreateFolderDto{

    @IsNotEmpty()
    @IsString()
    name:string;

    @IsOptional()
    @IsMongoId()
    parentId:string

}