import { IsNumber, IsPositive, Min, Max } from 'class-validator';

export class BorrowBooksDto {
  @IsNumber()
  @IsPositive()
  @Min(1)
  @Max(10)
  qty: number;

  @IsNumber()
  @IsPositive()
  @Min(1)
  @Max(30)
  days: number;
}
