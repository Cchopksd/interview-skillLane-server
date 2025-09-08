import { IsNotEmpty, IsUUID } from 'class-validator';

export class RequestBooksIdDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;
}
