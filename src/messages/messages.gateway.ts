import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { NewMessageDto } from './dto/new-message.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@WebSocketGateway({ cors: true })
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() webSocketServer: Server;

  constructor(
    private readonly messagesService: MessagesService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.token as string;
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify(token);
      console.log(payload);

      await this.messagesService.registerClient(client, payload.id);

      this.webSocketServer.emit(
        'clients-updated',
        this.messagesService.getConnectedClients(),
      );
    } catch (err) {
      client.disconnect();
      return;
    }
  }

  handleDisconnect(client: Socket) {
    this.messagesService.removeClient(client.id);

    this.webSocketServer.emit(
      'clients-updated',
      this.messagesService.getConnectedClients(),
    );
  }

  @SubscribeMessage('message-from-client')
  onMessageFromClient(client: Socket, payload: NewMessageDto) {
    // Emitir a todos menos al cliente que emite
    // client.broadcast.emit('message-from-server', {
    //   fullName: 'Soy yo',
    //   message: payload.message,
    // });

    // Emitir a todos incluyendo al cliente que emite el menaje
    this.webSocketServer.emit('message-from-server', {
      fullName: this.messagesService.getUserFullName(client.id),
      message: payload.message,
    });
  }
}
