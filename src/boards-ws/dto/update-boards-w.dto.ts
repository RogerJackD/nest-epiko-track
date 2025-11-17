import { PartialType } from '@nestjs/mapped-types';
import { CreateBoardsWDto } from './create-boards-w.dto';

export class UpdateBoardsWDto extends PartialType(CreateBoardsWDto) {
  id: number;
}
