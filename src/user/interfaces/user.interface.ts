import { User } from '../entity/user.entity';

export interface UserRepositoryInterface {
  findByUsername(username: string): Promise<User | null>;
  create(user: User): Promise<User>;
}
