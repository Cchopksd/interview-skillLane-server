import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { UserRepositoryInterface } from '../interfaces/user.interface';
import { PasswordUtils } from '@utils/password.utils';

@Injectable()
export class UserRepository implements UserRepositoryInterface {
  constructor(
    @InjectRepository(User) private readonly repository: Repository<User>,
  ) {}

  async findByUsername(username: string): Promise<User | null> {
    return this.repository.findOne({ where: { username } });
  }

  async create(user: User): Promise<User> {
    if (await this.findByUsername(user.username)) {
      throw new ConflictException('Username already exists');
    }

    const hashedPassword = await PasswordUtils.hashPassword(user.password);

    const newUser = this.repository.create({
      ...user,
      password: hashedPassword,
    });
    return this.repository.save(newUser);
  }
}
