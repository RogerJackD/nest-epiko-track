import { IsString } from "class-validator";

export class CreateUserDto {

    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    age: number

    email: string

    contractDate: string
}
