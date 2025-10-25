import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Between, In, Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskUser } from './entities/task-user.entity';
import { Board } from './entities/board.entity';
import { TaskStatus } from './entities/task-status.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { start } from 'repl';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(TaskStatus)
    private readonly taskStatusRepository: Repository<TaskStatus>,

    @InjectRepository(TaskUser)
    private readonly taskUserRepository: Repository<TaskUser>,
  ) {}

  create(createBoardDto: CreateBoardDto) {
    return 'This action adds a new board';
  }

  findAll() {
    return `This action returns all boards`;
  }

  findOne(id: number) {
    return `This action returns a #${id} board`;
  }

  update(id: number, updateBoardDto: UpdateBoardDto) {
    return `This action updates a #${id} board`;
  }

  remove(id: number) {
    return `This action removes a #${id} board`;
  }

  //todo : Gestion de Boards tareas
  async getBoardWithTasks(boardId: number) {
    //  Traer tareas (con sus relaciones)
    const tasks = await this.taskRepository.find({
      where: {
        board: { id: boardId },
      },
      relations: ['taskStatus', 'board', 'tasksUsers', 'tasksUsers.user'],
      order: {
        taskStatus: { sort_order: 'ASC' }, // orden por columna
        createdAt: 'DESC', // dentro de cada columna
      },
    });

    //  Traer el board (garantiza nombre incluso si no hay tareas)
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
      select: ['id', 'title'], // intenta traer title o name (ajusta según tu entidad)
    });

    //  Helper para normalizar el key del status (ej: "En Progreso" -> "en_progreso")
    const statusKey = (s: string) =>
      s
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^\w_]/g, '');

    const columns = tasks.reduce(
      (acc, task) => {
        //const key = statusKey(task?.taskStatus?.title || 'Sin estado');
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

  //todo TASKS
  async findOneTask(id: number) {
    const taskFound = await this.taskRepository.findOne({
      where: { id },
      relations: ['taskStatus', 'board', 'tasksUsers', 'tasksUsers.user'],
    });

    if(!taskFound){
      throw new BadRequestException(`Task with id ${id} not found`);
    }
    return taskFound;
  }

  async removeTask(id: number) {
    await this.taskRepository.softDelete(id);
    return { message: `Task with id ${id} has been soft deleted.` };
  }

  async updateTask(id: number, updateTaskDto: UpdateTaskDto) {
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

  return { message: `Task with id ${id} has been updated.` };
}

  async createBoardTask(id: number, createTaskDto: CreateTaskDto){
    const { userIds, ...task } = createTaskDto;

    const newTask = this.taskRepository.create({
      ...task, 
      board: {id} 
    });

    const savedTask = await this.taskRepository.save(newTask);

    if( userIds && userIds.length > 0 ){
      const taskUserRelations = userIds.map( userID => {
        return this.taskUserRepository.create({
          task: { id: savedTask.id },
          user: { id: userID }
        });
      });

      await this.taskUserRepository.save(taskUserRelations);
    }

    return { board: id, savedTask, userIds };
  }

  getBoardsByArea(areaId: number){
    return this.boardRepository.find({
      where: {
        area: { id: areaId }
      },
      select: ['id', 'title', 'description']
    })
  }


  async getUpcomingTasksByDueDate() {
    const now = new Date();
    console.log("hoy es:" ,now)
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    return this.taskRepository.find({
      where: {
        dueDate: Between(now, next24Hours), // entre ahora y las próximas 24h
      },
      relations: ['taskStatus', 'board', 'tasksUsers', 'tasksUsers.user', 'board.area'],
      order: {
        dueDate: 'ASC', // las más próximas primero
      },
    });
  }
}
