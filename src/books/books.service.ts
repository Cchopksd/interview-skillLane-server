import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BooksServiceInterface } from './interfaces/books-service.interface';
import { CreateBooksDto } from './dtos/create-books.dto';
import { UpdateBooksDto } from './dtos/update-books.dto';
import { RequestBooksIdDto } from './dtos/request-books-id.dto';
import { RequestBooksDto } from './dtos/request-books.dto';
import { Paginated, PaginationMeta } from 'src/utils/pagination-cal.util';
import { QtyBooksDto } from './dtos/qty-books.dto';
import { BooksRepositoryInterface } from './interfaces/books.interface';

@Injectable()
export class BooksService implements BooksServiceInterface {
  constructor(
    @Inject('BOOK_REPOSITORY')
    private readonly booksRepository: BooksRepositoryInterface,
  ) {}

  async findOne(dto: RequestBooksIdDto) {
    const book = await this.booksRepository.findOne(dto.id);
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  async findAll(dto: RequestBooksDto) {
    const { books, total } = await this.booksRepository.findAll(
      dto.page,
      dto.limit,
      dto.search,
    );
    const meta = PaginationMeta(dto.page, dto.limit, total);
    return { meta, data: books } satisfies Paginated<any>;
  }

  async create(dto: CreateBooksDto) {
    const book = await this.booksRepository.create(dto);
    return book;
  }

  async update({ id }: RequestBooksIdDto, dto: UpdateBooksDto) {
    const existingBook = await this.booksRepository.findOne(id);
    if (!existingBook) throw new NotFoundException('Book not found');

    const updatedBook = await this.booksRepository.update(id, dto);
    return updatedBook;
  }

  async delete({ id }: RequestBooksIdDto) {
    const existingBook = await this.booksRepository.findOne(id);
    if (!existingBook) throw new NotFoundException('Book not found');
    await this.booksRepository.delete(id);
  }

  async borrow({ id }: RequestBooksIdDto, dto: QtyBooksDto) {
    return this.booksRepository.reduceStock(id, dto.qty);
  }

  async return({ id }: RequestBooksIdDto, dto: QtyBooksDto) {
    return this.booksRepository.increaseStock(id, dto.qty);
  }
}
