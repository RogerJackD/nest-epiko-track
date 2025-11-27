// boards/boards.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Between, LessThan, Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskUser } from './entities/task-user.entity';
import { Board } from './entities/board.entity';
import { TaskStatus } from './entities/task-status.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Area } from './entities/area.entity';
import { BoardsWsGateway } from '../boards-ws/boards-ws.gateway';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(TaskStatus)
    private readonly taskStatusRepository: Repository<TaskStatus>,
    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,
    @InjectRepository(TaskUser)
    private readonly taskUserRepository: Repository<TaskUser>,
    private readonly boardsWsGateway: BoardsWsGateway,
  ) {}

  async createBoardByIdArea(createBoardDto: CreateBoardDto) {
    const { areaId, ...boardData } = createBoardDto;
    const newBoard = this.boardRepository.create(boardData);
    return this.boardRepository.save({ ...newBoard, area: { id: areaId } });
  }

  findAllBoards() {
    return this.boardRepository.find({
      relations: ['area'],
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} board`;
  }

  updateBoard(id: number, updateBoardDto: UpdateBoardDto) {
    const { areaId, ...boardData } = updateBoardDto;
    const updatedBoard = this.boardRepository.create({
      id,
      ...boardData
    });
    return this.boardRepository.save(updatedBoard);
  }

  remove(id: number) {
    return `This action removes a #${id} board`;
  }

  async getBoardWithTasks(boardId: number) {
    const tasks = await this.taskRepository.find({
      where: {
        board: { id: boardId, isActive: true },
      },
      relations: ['taskStatus', 'board', 'tasksUsers', 'tasksUsers.user'],
      order: {
        taskStatus: { sort_order: 'ASC' },
        createdAt: 'DESC',
      },
    });

    const board = await this.boardRepository.findOne({
      where: { id: boardId, isActive: true },
      select: ['id', 'title'],
    });

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

    return {
      board_id: boardId,
      board_name: board?.title ?? board?.title ?? null,
      columns,
    };
  }

  async findOneTask(id: number) {
    const taskFound = await this.taskRepository.findOne({
      where: { id },
      relations: ['taskStatus', 'board', 'tasksUsers', 'tasksUsers.user'],
    });

    if (!taskFound) {
      throw new BadRequestException(`Task with id ${id} not found`);
    }
    return taskFound;
  }

  async removeTask(id: number) {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['tasksUsers', 'tasksUsers.user', 'board'],
    });

    if (task) {
      const userIds = task.tasksUsers.map(tu => tu.user.id);
      const boardId = task.board.id;

      await this.taskRepository.softDelete(id);

      // ✨ Notificar eliminación a usuarios asignados (para notificaciones personales)
      if (userIds.length > 0) {
        this.boardsWsGateway.notifyTaskDeleted(userIds, id);
        console.log(`📤 Notificación de eliminación enviada a ${userIds.length} usuarios`);
      }

      // ✨ CRÍTICO: Usar setTimeout para asegurar que el evento se emita DESPUÉS de la respuesta HTTP
      setTimeout(async () => {
        await this.boardsWsGateway.notifyBoardChange(boardId);
        console.log(`🔄 Tablero ${boardId} sincronizado después de eliminar tarea ${id}`);
      }, 100);
    }

    return { message: `Task with id ${id} has been soft deleted.` };
  }

  async updateTask(id: number, updateTaskDto: UpdateTaskDto) {
    const previousTask = await this.taskRepository.findOne({
      where: { id },
      relations: ['tasksUsers', 'tasksUsers.user', 'board'],
    });

    await this.findOneTask(id);

    const { userIds, ...taskData } = updateTaskDto;

    await this.taskRepository.update(id, taskData);

    if (userIds !== undefined) {
      await this.taskUserRepository.delete({ task: { id } });

      if (userIds.length > 0) {
        const taskUserRelations = userIds.map(userId => {
          return this.taskUserRepository.create({
            task: { id },
            user: { id: userId }
          });
        });

        await this.taskUserRepository.save(taskUserRelations);
      }
    }

    const updatedTask = await this.taskRepository.findOne({
      where: { id },
      relations: ['tasksUsers', 'tasksUsers.user', 'board', 'board.area', 'taskStatus'],
    });

    if (updatedTask) {
      const previousUserIds = previousTask?.tasksUsers.map(tu => tu.user.id) || [];
      const newUserIds = updatedTask.tasksUsers.map(tu => tu.user.id);
      const allUserIds = [...new Set([...previousUserIds, ...newUserIds])];
      const boardId = updatedTask.board.id;

      // ✨ Notificar a usuarios asignados (para notificaciones personales)
      if (allUserIds.length > 0) {
        allUserIds.forEach(userId => {
          this.boardsWsGateway.notifyTaskUpdate(userId, updatedTask);
        });
        console.log(`📤 Notificación de actualización enviada a ${allUserIds.length} usuarios`);
      }

      // ✨ CRÍTICO: Usar setTimeout para asegurar que el evento se emita DESPUÉS de la respuesta HTTP
      setTimeout(async () => {
        await this.boardsWsGateway.notifyBoardChange(boardId);
        console.log(`🔄 Tablero ${boardId} sincronizado después de actualizar tarea ${id}`);
      }, 100);
    }

    return { message: `Task with id ${id} has been updated.` };
  }

  async createBoardTask(id: number, createTaskDto: CreateTaskDto) {
    const { userIds, ...task } = createTaskDto;

    const newTask = this.taskRepository.create({
      ...task,
      board: { id }
    });

    const savedTask = await this.taskRepository.save(newTask);

    if (userIds && userIds.length > 0) {
      const taskUserRelations = userIds.map(userID => {
        return this.taskUserRepository.create({
          task: { id: savedTask.id },
          user: { id: userID }
        });
      });

      await this.taskUserRepository.save(taskUserRelations);
    }

    const completeTask = await this.taskRepository.findOne({
      where: { id: savedTask.id },
      relations: ['tasksUsers', 'tasksUsers.user', 'board', 'board.area', 'taskStatus'],
    });

    if (completeTask) {
      const boardId = completeTask.board.id;

      // ✨ Notificar a usuarios asignados (para notificaciones personales)
      if (userIds && userIds.length > 0) {
        this.boardsWsGateway.notifyNewTask(userIds, completeTask);
        console.log(`📤 Notificación de nueva tarea enviada a ${userIds.length} usuarios`);
      }

      // ✨ CRÍTICO: Usar setTimeout para asegurar que el evento se emita DESPUÉS de la respuesta HTTP
      setTimeout(async () => {
        await this.boardsWsGateway.notifyBoardChange(boardId);
        console.log(`🔄 Tablero ${boardId} sincronizado después de crear tarea ${savedTask.id}`);
      }, 100);
    }

    return { board: id, savedTask, userIds };
  }

  async getAllAreas() {
    const areas = await this.areaRepository.find();
    return areas;
  }

  async getBoardsByArea(areaId: number) {
    return this.boardRepository.find({
      where: {
        isActive: true,
        area: { id: areaId }
      },
      select: ['id', 'title', 'description']
    })
  }

  async getUpcomingTasksByDueDate() {
    const now = new Date();
    console.log("hoy es:", now)
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    return this.taskRepository.find({
      where: {
        dueDate: Between(now, next24Hours),
      },
      relations: ['taskStatus', 'board', 'tasksUsers', 'tasksUsers.user', 'board.area'],
      order: {
        dueDate: 'ASC',
      },
    });
  }

  // tareas ya vencidas segun fecha actual de la base de datos
  async getOverdueTasksByDueDate() {
    const now = new Date();
    return this.taskRepository.find({
      where: {
        dueDate: LessThan(now),
      },
      relations: ['taskStatus', 'board', 'tasksUsers', 'tasksUsers.user', 'board.area'],
      order: {
        dueDate: 'ASC',
      },
    });
  }
}