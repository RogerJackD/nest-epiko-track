import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  //todo : Gestion de Boards
  @Post()
  create(@Body() createBoardDto: CreateBoardDto) {
    return this.boardsService.create(createBoardDto);
  }

  @Get()
  findAll() {
    return this.boardsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.boardsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBoardDto: UpdateBoardDto) {
    return this.boardsService.update(+id, updateBoardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.boardsService.remove(+id);
  }

  //todo : gestion de tareassss:

  @Delete('tasks/:id')
  deleteTask(@Param('id') id: string) {
    return this.boardsService.removeTask(+id);
  }
  
  @Patch('tasks/:id')
  updateTask(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.boardsService.updateTask(+id, updateTaskDto);
  }
  
  //todo todas las tareas proximas a vencer
  @Get('tasks/upcoming/due-date')
  getUpcomingTasksByDueDate() {
    return this.boardsService.getUpcomingTasksByDueDate();
  }


  //todo: Gestion de tareas con board
  @Get(':boardId/tasks')
  getBoardWithTasks(@Param('boardId') id: string){
    return this.boardsService.getBoardWithTasks(+id)
  }

  @Post(':boardId/tasks')
  createBoardTask(@Param('boardId') id: string, @Body() createTaskDto: CreateTaskDto){
    return this.boardsService.createBoardTask(+id, createTaskDto);
  }

  //todo : gestion de areas
  //obtener tableros por area
  @Get('area/:areaId')
  getBoardsByArea(@Param('areaId') areaId: string){
    return this.boardsService.getBoardsByArea(+areaId);
  }


}
