import { Module } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { Board } from './entities/board.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [BoardsController],
  providers: [BoardsService],
  imports: [
    TypeOrmModule.forFeature([Board]),
  ],
})
export class BoardsModule {}
