import { User } from '../entity/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';

export interface UserServiceInterface {
  findByUsername(username: string): Promise<User>;
  create(dto: CreateUserDto): Promise<User>;
}
