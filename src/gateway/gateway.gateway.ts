import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface AuthenticatedSocket extends Socket {
  userId?: number;
  restaurantId?: number;
  role?: string;
}

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      process.env.CORS_ORIGIN,
    ].filter(Boolean),
    credentials: true,
  },
  namespace: '/',
})
export class GatewayGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GatewayGateway.name);
  private connectedClients = new Map<string, AuthenticatedSocket>();

  constructor(
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake auth or query
      const token =
        client.handshake.auth?.token ||
        client.handshake.query?.token?.toString();

      if (token) {
        try {
          const payload = this.jwtService.verify(token);
          client.userId = payload.userId;
          client.restaurantId = payload.restaurantId;
          client.role = payload.role;

          this.connectedClients.set(client.id, client);
          this.logger.log(
            `Client connected: ${client.id} (User: ${client.userId}, Role: ${client.role})`,
          );

          // Join user-specific room
          client.join(`user:${client.userId}`);
          if (client.restaurantId) {
            client.join(`restaurant:${client.restaurantId}`);
          }
          if (client.role) {
            client.join(`role:${client.role}`);
          }
        } catch (error) {
          this.logger.warn(`Invalid token for client ${client.id}`);
          client.disconnect();
        }
      } else {
        // Allow anonymous connections for customer/public features
        this.connectedClients.set(client.id, client);
        this.logger.log(`Anonymous client connected: ${client.id}`);
      }
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe:orders')
  async handleSubscribeOrders(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { restaurantId?: number; tableNumber?: string },
  ) {
    if (client.restaurantId) {
      client.join(`restaurant:${client.restaurantId}:orders`);
      this.logger.log(
        `Client ${client.id} subscribed to orders for restaurant ${client.restaurantId}`,
      );
    }
    if (data.tableNumber) {
      client.join(`table:${data.tableNumber}:orders`);
      this.logger.log(
        `Client ${client.id} subscribed to orders for table ${data.tableNumber}`,
      );
    }
  }

  @SubscribeMessage('subscribe:kitchen')
  async handleSubscribeKitchen(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { restaurantId: number },
  ) {
    if (client.restaurantId === data.restaurantId || client.role === 'chef') {
      client.join(`kitchen:${data.restaurantId}`);
      this.logger.log(
        `Client ${client.id} subscribed to kitchen updates for restaurant ${data.restaurantId}`,
      );
    }
  }

  @SubscribeMessage('subscribe:order-status')
  async handleSubscribeOrderStatus(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { orderId: number },
  ) {
    client.join(`order:${data.orderId}`);
    this.logger.log(`Client ${client.id} subscribed to order ${data.orderId}`);
  }

  // Emit order update to relevant clients
  async emitOrderUpdate(order: any) {
    // Emit to restaurant staff
    if (order.restaurantId) {
      this.server
        .to(`restaurant:${order.restaurantId}:orders`)
        .emit('order:update', order);
    }

    // Emit to specific table
    if (order.tableNumber) {
      this.server
        .to(`table:${order.tableNumber}:orders`)
        .emit('order:update', order);
    }

    // Emit to specific order subscribers
    this.server.to(`order:${order.id}`).emit('order:update', order);

    // Emit to kitchen if order is in kitchen status
    if (
      ['received', 'in_progress', 'ready'].includes(order.status) &&
      order.restaurantId
    ) {
      this.server
        .to(`kitchen:${order.restaurantId}`)
        .emit('kitchen:order-update', order);
    }

    this.logger.log(`Order update emitted for order ${order.id}`);
  }

  // Emit notification to user
  async emitNotification(userId: number, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
    this.logger.log(`Notification sent to user ${userId}`);
  }

  // Emit to all restaurant staff
  async emitToRestaurant(restaurantId: number, event: string, data: any) {
    this.server.to(`restaurant:${restaurantId}`).emit(event, data);
  }

  // Emit to all chefs in restaurant
  async emitToKitchen(restaurantId: number, event: string, data: any) {
    this.server.to(`kitchen:${restaurantId}`).emit(event, data);
  }
}

