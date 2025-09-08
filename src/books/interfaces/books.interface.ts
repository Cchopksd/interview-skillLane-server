import { Book } from '../entities/books.entity';

export interface BooksRepositoryInterface {
  findOne(id: string): Promise<Book | null>;
  findAll(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ books: Book[]; total: number }>;
  create(book: Book): Promise<Book>;
  update(id: string, book: Book): Promise<Book>;
  delete(id: string): Promise<void>;
  updateStock(id: string, qty: number): Promise<Book>;
}
