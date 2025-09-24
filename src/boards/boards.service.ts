import { Injectable } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { In, Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskUser } from './entities/task-user.entity';
import { Board } from './entities/board.entity';
import { TaskStatus } from './entities/task-status.entity';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(TaskStatus)
    private readonly taskStatusRepository: Repository<TaskStatus>,
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
    // 1) Traer tareas (con sus relaciones)
    const tasks = await this.taskRepository.find({
      where: {
        board: { id: boardId },
        // si quieres filtrar por ids de status, cámbialo aquí:
        // taskStatus: { id: In([1, 2, 3]) }
      },
      relations: ['taskStatus', 'board'],
      order: {
        taskStatus: { sort_order: 'ASC' }, // orden por columna
        createdAt: 'DESC', // dentro de cada columna
      },
    });

    // 2) Traer el board (garantiza nombre incluso si no hay tareas)
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
      select: ['id', 'title'], // intenta traer title o name (ajusta según tu entidad)
    });

    // 3) Helper para normalizar el key del status (ej: "En Progreso" -> "en_progreso")
    const statusKey = (s: string) =>
      s
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^\w_]/g, '');

    // 4) Agrupar tareas por status
    const columns = tasks.reduce(
      (acc, task) => {
        const key = statusKey(task.taskStatus.title || 'unknown');
        if (!acc[key]) {
          acc[key] = {
            name: task.taskStatus.title,
            tasks: [],
          };
        }

        acc[key].tasks.push({
          id: task.id,
          title: task.title,
          status: key,
          position: (task as any).position ?? null, // ajusta al campo real si lo tienes
          // ...otros campos que quieras exponer
        });

        return acc;
      },
      {} as Record<string, { name: string; tasks: any[] }>,
    );

    // 5) Resultado final (con nombre del tablero)
    return {
      board_id: boardId,
      board_name: board?.title ?? board?.title ?? null,
      columns,
    };
  }


  async createBoardTask(id: number, createTaskDto: CreateBoardDto){
    return {id, createTaskDto}
  }
}
