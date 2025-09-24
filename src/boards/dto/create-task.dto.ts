import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";
import { TypePriority } from "../entities/task.entity";

export class CreateTaskDto {
    
    @IsString()
    title: string;

    @IsOptional()
    description: string;

    @IsOptional()
    @IsDateString()
    startDate: string;

    @IsOptional()
    @IsDateString()
    dueDate: string;

    @IsEnum(TypePriority)
    @IsOptional()
    priority : TypePriority;
}