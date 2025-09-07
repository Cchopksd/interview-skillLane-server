import { Book } from '../entities/books.entity';

export interface BooksRepositoryInterface {
  findOne(id: string): Promise<Book>;
  findAll(page: number, limit: number): Promise<Book[]>;
  create(book: Partial<Book>): Promise<Book>;
  update(id: string, book: Partial<Book>): Promise<Book>;
  delete(id: string): Promise<void>;
  reduceStock(id: string, qty: number): Promise<Book>;
  increaseStock(id: string, qty: number): Promise<Book>;
}
