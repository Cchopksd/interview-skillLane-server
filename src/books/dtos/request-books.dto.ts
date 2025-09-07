import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RequestBooksDto {
  @IsNumber()
  @IsNotEmpty()
  page: number;

  @IsNumber()
  @IsNotEmpty()
  limit: number;

  @IsString()
  @IsNotEmpty()
  search: string;
}
