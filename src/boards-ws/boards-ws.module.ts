import { Module } from '@nestjs/common';
import { BoardsWsService } from './boards-ws.service';
import { BoardsWsGateway } from './boards-ws.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from 'src/boards/entities/task.entity';
import { TaskUser } from 'src/boards/entities/task-user.entity';
import { User } from 'src/auth/entities/auth.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, TaskUser, User]),
  ],
  providers: [BoardsWsGateway, BoardsWsService],
  exports: [BoardsWsService],
})
export class BoardsWsModule {}
