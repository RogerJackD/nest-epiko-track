// boards-ws/boards-ws.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../boards/entities/task.entity';
import { TaskUser } from '../boards/entities/task-user.entity';
import { User } from '../auth/entities/auth.entity';
import { In, IsNull } from 'typeorm';

@Injectable()
export class BoardsWsService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskUser)
    private readonly taskUserRepository: Repository<TaskUser>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getUserTasks(userId: string): Promise<Task[]> {
  // Verificar que el usuario existe
  const user = await this.userRepository.findOne({
    where: { id: userId },
  });

  if (!user) {
    throw new Error(`Usuario con ID ${userId} no encontrado`);
  }

  // Obtener los IDs de las tareas asignadas al usuario
  const taskUsers = await this.taskUserRepository.find({
    where: { user: { id: userId } },
    relations: ['task'],
  });

  const taskIds = taskUsers.map((tu) => tu.task.id);

  if (taskIds.length === 0) {
    return []; // El usuario no tiene tareas asignadas
  }

  // Obtener las tareas completas con TODOS los usuarios asignados
  const tasks = await this.taskRepository.find({
    where: {
      id: In(taskIds),
      deleteAt: IsNull(),
    },
    relations: ['tasksUsers', 'tasksUsers.user', 'board', 'board.area', 'taskStatus'],
    order: { createdAt: 'DESC' },
  });

  return tasks;
}

  async getTasksByBoard(boardId: number): Promise<Task[]> {
    return await this.taskRepository.find({
      where: { board: { id: boardId } },
      relations: ['tasksUsers', 'tasksUsers.user', 'board', 'board.area', 'taskStatus'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllActiveTasks(): Promise<Task[]> {
    return await this.taskRepository.find({
      where: { deleteAt: IsNull() },
      relations: ['tasksUsers', 'tasksUsers.user', 'board', 'board.area', 'taskStatus'],
      order: { createdAt: 'DESC' },
    });
  }
}