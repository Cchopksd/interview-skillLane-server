import { IsNumber, IsPositive, Min, Max } from 'class-validator';

export class ReturnBooksDto {
  @IsNumber()
  @IsPositive()
  @Min(1)
  @Max(10)
  qty: number;
}
