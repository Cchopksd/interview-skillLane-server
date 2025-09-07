import { IsNotEmpty, IsNumber } from 'class-validator';

export class QtyBooksDto {
  @IsNumber()
  @IsNotEmpty()
  qty: number;
}
