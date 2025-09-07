import { Paginated } from '../../utils/pagination-cal.util';
import { RequestBooksIdDto } from '../dtos/request-books-id.dto';
import { Book } from '../entities/books.entity';
import { CreateBooksDto } from '../dtos/create-books.dto';
import { QtyBooksDto } from '../dtos/qty-books.dto';
import { UpdateBooksDto } from '../dtos/update-books.dto';
import { RequestBooksDto } from '../dtos/request-books.dto';

export interface BooksServiceInterface {
  findOne(id: RequestBooksIdDto): Promise<Book>;
  findAll(dto: RequestBooksDto): Promise<Paginated<Book[]>>;
  create(dto: CreateBooksDto): Promise<Book>;
  update(id: RequestBooksIdDto, dto: UpdateBooksDto): Promise<Book>;
  delete(id: RequestBooksIdDto): Promise<void>;
  borrow(id: RequestBooksIdDto, qty: QtyBooksDto): Promise<Book>;
  return(id: RequestBooksIdDto, qty: QtyBooksDto): Promise<Book>;
}
