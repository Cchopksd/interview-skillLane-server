import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateBooksDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsNumber()
  @IsNotEmpty()
  totalQuantity: number;

  @IsString()
  @IsNotEmpty()
  ISBN: string;

  @IsNumber()
  @IsNotEmpty()
  publicationYear: number;
}
