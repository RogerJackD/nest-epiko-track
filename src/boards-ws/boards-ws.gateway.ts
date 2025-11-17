// boards-ws/boards-ws.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BoardsWsService } from './boards-ws.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // En producción, especifica tu dominio
  },
})
export class BoardsWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(BoardsWsGateway.name);
  private connectedClients: Map<string, string> = new Map(); // socketId -> userId

  constructor(private readonly boardsWsService: BoardsWsService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const userId = this.connectedClients.get(client.id);
    this.connectedClients.delete(client.id);
    this.logger.log(`Cliente desconectado: ${client.id} (Usuario: ${userId})`);
  }

  /**
   * Evento para que el cliente se suscriba a las tareas de un usuario específico
   * @param userId - UUID del usuario
   * @param client - Socket del cliente conectado
   */
  @SubscribeMessage('subscribe-user-tasks')
  async handleSubscribeUserTasks(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { userId } = data;

    try {
      // Guardar la relación socket-usuario
      this.connectedClients.set(client.id, userId);

      // Hacer que el cliente se una a una sala específica del usuario
      client.join(`user-${userId}`);

      // Obtener las tareas del usuario
      const tasks = await this.boardsWsService.getUserTasks(userId);

      this.logger.log(`Usuario ${userId} suscrito. Tareas encontradas: ${tasks.length}`);

      // Enviar las tareas iniciales al cliente
      return {
        event: 'user-tasks',
        data: {
          userId,
          tasks,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(`Error al suscribir usuario ${userId}:`, error.message);
      return {
        event: 'error',
        data: {
          message: error.message,
          userId,
        },
      };
    }
  }

  /**
   * Evento para obtener tareas de un usuario sin suscribirse
   * @param userId - UUID del usuario
   */
  @SubscribeMessage('get-user-tasks')
  async handleGetUserTasks(@MessageBody() data: { userId: string }) {
    const { userId } = data;

    try {
      const tasks = await this.boardsWsService.getUserTasks(userId);

      this.logger.log(`Tareas obtenidas para usuario ${userId}: ${tasks.length}`);

      return {
        event: 'user-tasks',
        data: {
          userId,
          tasks,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(`Error al obtener tareas de usuario ${userId}:`, error.message);
      return {
        event: 'error',
        data: {
          message: error.message,
          userId,
        },
      };
    }
  }

  /**
   * Evento para obtener todas las tareas de un tablero
   * @param boardId - ID del tablero
   */
  @SubscribeMessage('get-board-tasks')
  async handleGetBoardTasks(@MessageBody() data: { boardId: number }) {
    const { boardId } = data;

    try {
      const tasks = await this.boardsWsService.getTasksByBoard(boardId);

      this.logger.log(`Tareas obtenidas para tablero ${boardId}: ${tasks.length}`);

      return {
        event: 'board-tasks',
        data: {
          boardId,
          tasks,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(`Error al obtener tareas del tablero ${boardId}:`, error.message);
      return {
        event: 'error',
        data: {
          message: error.message,
          boardId,
        },
      };
    }
  }

  /**
   * Método para notificar cambios en tareas a usuarios específicos
   * Se puede llamar desde otros servicios cuando se actualice una tarea
   */
  notifyTaskUpdate(userId: string, task: any) {
    this.server.to(`user-${userId}`).emit('task-updated', {
      task,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Método para notificar a todos los usuarios de un tablero
   */
  notifyBoardUpdate(boardId: number, tasks: any[]) {
    this.server.to(`board-${boardId}`).emit('board-updated', {
      boardId,
      tasks,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Método para notificar cuando se crea una nueva tarea
   */
  notifyNewTask(userIds: string[], task: any) {
    userIds.forEach((userId) => {
      this.server.to(`user-${userId}`).emit('task-created', {
        task,
        timestamp: new Date().toISOString(),
      });
    });
  }

  /**
   * Método para notificar cuando se elimina una tarea
   */
  notifyTaskDeleted(userIds: string[], taskId: number) {
    userIds.forEach((userId) => {
      this.server.to(`user-${userId}`).emit('task-deleted', {
        taskId,
        timestamp: new Date().toISOString(),
      });
    });
  }
}