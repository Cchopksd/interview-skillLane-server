import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { UsersService } from './users.service';
import { UserRepository } from './repository/user.repository';
import { UserController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [
    { provide: 'USER_REPOSITORY', useClass: UserRepository },
    UsersService,
  ],
  exports: [
    UsersService,
    { provide: 'USER_REPOSITORY', useClass: UserRepository },
  ],
})
export class UserModule {}
