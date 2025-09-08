import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entity/user.entity';
import { UsersService } from './users.service';
import { UserRepository } from './repository/user.repository';
import { UserController } from './user.controller';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '1d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UserController],
  providers: [
    { provide: 'USER_REPOSITORY', useClass: UserRepository },
    UsersService,
    JwtStrategy,
  ],
  exports: [
    UsersService,
    { provide: 'USER_REPOSITORY', useClass: UserRepository },
    JwtStrategy,
  ],
})
export class UserModule {}
