import { IsNotEmpty, IsString } from 'class-validator';

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

  @IsString()
  @IsNotEmpty()
  ISBN: string;

  @IsString()
  @IsNotEmpty()
  publicationYear: string;
}
