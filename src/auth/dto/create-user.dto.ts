import { IsDateString, IsEmail, IsNumber, IsOptional, IsPhoneNumber, IsString } from "class-validator";

export class CreateUserDto {

    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsOptional()
    @IsNumber()
    age: number;

    @IsOptional()
    @IsEmail()  
    email: string;

    @IsDateString()
    @IsOptional()
    contractDate: string;

    @IsOptional()
    @IsString()
    job_title: string;

    @IsOptional()
    @IsString()
    address: string;

    @IsPhoneNumber('PE')
    @IsOptional()
    phoneNumber: string;
    
}
