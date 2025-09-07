import { Inject, Injectable } from '@nestjs/common';
import { BooksRepositoryInterface } from './interfaces/books.interface';
import { BooksServiceInterface } from './interfaces/books-service.interface';

@Injectable()
export class BooksService implements BooksServiceInterface {
  constructor(
    @Inject('BOOK_REPOSITORY')
    private readonly booksRepository: BooksRepositoryInterface,
  ) {}
}
