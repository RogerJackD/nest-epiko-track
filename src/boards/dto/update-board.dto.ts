import { PartialType } from '@nestjs/mapped-types';
import { CreateBoardDto } from './create-board.dto';
import { IsOptional } from 'class-validator';

export class UpdateBoardDto extends PartialType(CreateBoardDto) {
    @IsOptional()
    isActive?: boolean;
}
