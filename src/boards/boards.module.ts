import { Module } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { Board } from './entities/board.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Area } from './entities/area.entity';
import { TaskUser } from './entities/task-user.entity';
import { Task } from './entities/task.entity';
import { TaskStatus } from './entities/task-status.entity';

@Module({
  controllers: [BoardsController],
  providers: [BoardsService],
  imports: [
    TypeOrmModule.forFeature([Board, Area, TaskUser, Task, TaskStatus]),
  ],
})
export class BoardsModule {}
