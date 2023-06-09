import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { SigninUserDto } from './dto/signin-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    try {
      createUserDto.password = bcrypt.hashSync(createUserDto.password, 10);
      const user = this.userRepository.create(createUserDto);
      await this.userRepository.save(user);

      delete user.password;

      return {
        ...user,
        token: this.getJwtToken({ id: user.id }),
      };
    } catch (err) {
      this.handleDBError(err);
    }
  }

  async signin(signinUserDto: SigninUserDto) {
    const { email, password } = signinUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { id: true, email: true, password: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    delete user.password;

    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  async refreshToken(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  async deleteAllUsers() {
    const query = this.userRepository.createQueryBuilder('users');

    try {
      return await query.delete().where({}).execute();
    } catch (err) {
      this.handleDBError(err);
    }
  }

  private handleDBError(err: any): never {
    if (err.code === '23505') {
      throw new BadRequestException(err.detail);
    }

    console.error(err);
    throw new InternalServerErrorException(
      'Unexpected error, something went wrong',
    );
  }

  private getJwtToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }
}
