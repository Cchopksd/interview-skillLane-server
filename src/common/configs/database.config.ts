import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('POSTGRES_HOST', 'localhost'),
  port: configService.get<number>('POSTGRES_PORT', 5432),
  username: configService.get<string>('POSTGRES_USER', 'postgres'),
  password: configService.get<string>('POSTGRES_PASSWORD', 'password'),
  database: configService.get<string>('POSTGRES_DB', 'skilllane_db'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],

  synchronize: false,
  logging: false,
});
