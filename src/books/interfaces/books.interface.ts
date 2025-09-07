import { Book } from '../entities/books.entity';

export interface BooksRepositoryInterface {
  findOne(id: string): Promise<Book | null>;
  findAll(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ books: Book[]; total: number }>;
  create(
    book: Book,
    file?: { url: string; path: string } | null,
  ): Promise<Book>;
  update(
    id: string,
    book: Book,
    coverImage?: { url: string; path: string } | null,
  ): Promise<Book>;
  delete(id: string): Promise<void>;
  reduceStock(id: string, qty: number): Promise<Book>;
  increaseStock(id: string, qty: number): Promise<Book>;
}
