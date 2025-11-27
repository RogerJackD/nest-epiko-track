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
   *Evento para suscribirse a un tablero específico
   * Los clientes se unen a una sala por boardId para recibir actualizaciones en tiempo real
   */
  @SubscribeMessage('subscribe-board')
  async handleSubscribeBoard(
    @MessageBody() data: { boardId: number; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { boardId, userId } = data;

    try {
      // Guardar relación socket-usuario
      this.connectedClients.set(client.id, userId);

      // Unir cliente a la sala del tablero
      client.join(`board-${boardId}`);


      // Obtener datos iniciales del tablero
      const boardData = await this.boardsWsService.getBoardWithTasksForSocket(boardId);
      // Emitir directamente al cliente, no usar return
      client.emit('board-data', {
        boardId,
        ...boardData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Stack trace:`, error.stack);
      
      client.emit('error', {
        message: error.message,
        boardId,
      });
    }
  }

  /**
   * Desuscribirse de un tablero
   */
  @SubscribeMessage('unsubscribe-board')
  handleUnsubscribeBoard(
    @MessageBody() data: { boardId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const { boardId } = data;
    client.leave(`board-${boardId}`);
    this.logger.log(`Cliente ${client.id} se desuscribió del tablero ${boardId}`);
  }

  /**
   * Evento para que el cliente se suscriba a las tareas de un usuario específico
   */
  @SubscribeMessage('subscribe-user-tasks')
  async handleSubscribeUserTasks(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { userId } = data;

    try {
      this.connectedClients.set(client.id, userId);
      client.join(`user-${userId}`);

      const tasks = await this.boardsWsService.getUserTasks(userId);
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

  // ============================================
  // 🚀 MÉTODOS PARA NOTIFICACIONES EN TIEMPO REAL
  // ============================================

  /**
   * ✨ NUEVO: Notificar cambios completos del tablero a todos los usuarios conectados
   * Este es el método principal para mantener sincronizado el Kanban
   */
  async notifyBoardChange(boardId: number) {
    try {
      this.logger.log(`🔄 Iniciando notificación de cambios para tablero ${boardId}...`);
      
      const boardData = await this.boardsWsService.getBoardWithTasksForSocket(boardId);
      
      this.logger.log(`📦 Datos obtenidos, emitiendo a sala board-${boardId}...`);
      
      this.server.to(`board-${boardId}`).emit('board-updated', {
        boardId,
        ...boardData,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`✅ Tablero ${boardId} actualizado para todos los clientes suscritos`);
    } catch (error) {
      this.logger.error(`❌ Error al notificar cambios del tablero ${boardId}:`, error.message);
      this.logger.error(`Stack:`, error.stack);
    }
  }

  /**
   * Método para notificar cambios en tareas a usuarios específicos
   * (MANTENER para las notificaciones de usuario)
   */
  notifyTaskUpdate(userId: string, task: any) {
    this.server.to(`user-${userId}`).emit('task-updated', {
      task,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Método para notificar cuando se crea una nueva tarea
   * (MANTENER para las notificaciones de usuario)
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
   * (MANTENER para las notificaciones de usuario)
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