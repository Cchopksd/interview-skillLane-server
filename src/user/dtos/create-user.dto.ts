import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
