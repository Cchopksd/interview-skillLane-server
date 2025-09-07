import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class RequestBooksDto {
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  page: number = 1;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  limit: number = 10;

  @IsString()
  @IsOptional()
  search: string = '';
}
