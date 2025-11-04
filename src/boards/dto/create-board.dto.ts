import { IsNumber, IsString } from "class-validator";

export class CreateBoardDto {

    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsNumber()
    areaId: number;
}
