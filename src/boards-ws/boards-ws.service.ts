// boards-ws/boards-ws.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In } from 'typeorm';
import { Task } from '../boards/entities/task.entity';
import { TaskUser } from '../boards/entities/task-user.entity';
import { User } from '../auth/entities/auth.entity';

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
    try {
      // Verificar que el usuario existe
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new Error(`Usuario con ID ${userId} no encontrado`);
      }

      //solo tareas que pertencen a un tablero board.isActive = true
      // Método 1: Usar QueryBuilder (más robusto)
      const tasks = await this.taskRepository
        .createQueryBuilder('task')
        .innerJoin('task.tasksUsers', 'taskUser')
        .innerJoin('taskUser.user', 'assignedUser')
        .leftJoinAndSelect('task.tasksUsers', 'allTaskUsers')
        .leftJoinAndSelect('allTaskUsers.user', 'user')
        .leftJoinAndSelect('task.board', 'board')
        .leftJoinAndSelect('board.area', 'area')
        .leftJoinAndSelect('task.taskStatus', 'taskStatus')
        .where('assignedUser.id = :userId', { userId })
        .andWhere('task.deleteAt IS NULL')
        .andWhere('board.isActive = :isActive', { isActive: true })
        .orderBy('task.createdAt', 'DESC')
        .getMany();

      console.log(`Tareas encontradas para usuario ${userId}:`, tasks.length);
      return tasks;
      
    } catch (error) {
      console.error(`Error en getUserTasks para usuario ${userId}:`, error.message);
      throw error;
    }
  }

  async getTasksByBoard(boardId: number): Promise<Task[]> {
    try {
      return await this.taskRepository.find({
        where: { 
          board: { id: boardId },
          deleteAt: IsNull()
        },
        relations: ['tasksUsers', 'tasksUsers.user', 'board', 'board.area', 'taskStatus'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      console.error(`Error en getTasksByBoard para tablero ${boardId}:`, error.message);
      throw error;
    }
  }

  async getAllActiveTasks(): Promise<Task[]> {
    try {
      return await this.taskRepository.find({
        where: { deleteAt: IsNull() },
        relations: ['tasksUsers', 'tasksUsers.user', 'board', 'board.area', 'taskStatus'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      console.error('Error en getAllActiveTasks:', error.message);
      throw error;
    }
  }
}