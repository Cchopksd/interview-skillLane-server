import { IsNotEmpty, IsUUID } from 'class-validator';

export class RequestBooksIdDto {
  @IsUUID('4')
  @IsNotEmpty()
  id: string;
}
