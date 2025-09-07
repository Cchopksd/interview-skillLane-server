import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class QtyBooksDto {
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  qty: number;
}
