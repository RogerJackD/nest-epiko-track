// boards-ws/boards-ws.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Task } from '../boards/entities/task.entity';
import { TaskUser } from '../boards/entities/task-user.entity';
import { User } from '../auth/entities/auth.entity';
import { Board } from '../boards/entities/board.entity';

@Injectable()
export class BoardsWsService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskUser)
    private readonly taskUserRepository: Repository<TaskUser>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
  ) {}

  async getUserTasks(userId: string): Promise<Task[]> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new Error(`Usuario con ID ${userId} no encontrado`);
      }

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

  /**
   * ✨ NUEVO: Obtener datos del tablero en formato Kanban para WebSocket
   * Replica la estructura de getBoardWithTasks del BoardsService
   */
  async getBoardWithTasksForSocket(boardId: number) {
    try {
      console.log(`📊 Obteniendo tareas para tablero ${boardId}...`);

      const tasks = await this.taskRepository.find({
        where: {
          board: { id: boardId, isActive: true },
          deleteAt: IsNull(),
        },
        relations: ['taskStatus', 'board', 'tasksUsers', 'tasksUsers.user'],
        order: {
          taskStatus: { sort_order: 'ASC' },
          createdAt: 'DESC',
        },
      });

      console.log(`📋 Tareas encontradas: ${tasks.length}`);

      const board = await this.boardRepository.findOne({
        where: { id: boardId, isActive: true },
        select: ['id', 'title'],
      });

      console.log(`🏢 Tablero encontrado:`, board);

      if (!board) {
        throw new Error(`Tablero con ID ${boardId} no encontrado o inactivo`);
      }

      const statusKey = (s: string) =>
        s
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^\w_]/g, '');

      const columns = tasks.reduce(
        (acc, task) => {
          const statusTitle = task.taskStatus?.title ?? 'Sin estado';
          const key = statusKey(statusTitle);
          if (!acc[key]) {
            acc[key] = {
              name: statusTitle,
              tasks: [],
            };
          }

          acc[key].tasks.push({
            id: task.id,
            title: task.title,
            status: key,
            description: task.description,
            startDate: task?.startDate,
            dueDate: task?.dueDate,
            priority: task?.priority,
            assignedUsers: task?.tasksUsers,
          });

          return acc;
        },
        {} as Record<string, { name: string; tasks: any[] }>,
      );

      const result = {
        board_id: boardId,
        board_name: board?.title ?? null,
        columns,
      };

      console.log(`✅ Resultado generado:`, JSON.stringify(result, null, 2));

      return result;
    } catch (error) {
      console.error(`❌ Error en getBoardWithTasksForSocket para tablero ${boardId}:`, error.message);
      console.error(`Stack:`, error.stack);
      throw error;
    }
  }
}