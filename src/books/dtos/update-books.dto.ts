import { Transform } from 'class-transformer';
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class UpdateBooksDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  author?: string;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  totalQuantity?: number;

  @IsString()
  @IsOptional()
  ISBN?: string;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  publicationYear?: number;
}
