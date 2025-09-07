import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserServiceInterface } from './interfaces/user-service.interface';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserRepositoryInterface } from './interfaces/user.interface';
import { User } from './entity/user.entity';

@Injectable()
export class UsersService implements UserServiceInterface {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async findByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findByUsername(username);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const userData = {
      ...dto,
    } as User;

    const user = await this.userRepository.create(userData);
    return user;
  }
}
