import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Socket } from 'socket.io';
import { User } from '../auth/entities/user.entity';

interface ConnectedClients {
  [id: string]: {
    client: Socket;
    user: User;
  };
}

@Injectable()
export class MessagesService {
  private connectedClients: ConnectedClients = {};

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async registerClient(client: Socket, userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new Error('Unauthorized user');
    }

    if (!user.isActive) {
      throw new Error('Unauthorized user');
    }

    this.checkUserConnection(user);

    this.connectedClients[client.id] = {
      client,
      user,
    };
  }

  removeClient(clientId: string) {
    delete this.connectedClients[clientId];
  }

  getConnectedClients(): string[] {
    return Object.keys(this.connectedClients);
  }

  getUserFullName(socketId: string) {
    return this.connectedClients[socketId].user.fullName;
  }

  private checkUserConnection(user: User) {
    for (const clientId of Object.keys(this.connectedClients)) {
      const connectedClient = this.connectedClients[clientId];

      if (connectedClient.user.id === user.id) {
        connectedClient.client.disconnect();
        break;
      }
    }
  }
}
