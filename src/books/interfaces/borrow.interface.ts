import { Book } from '../entities/books.entity';
import { BorrowRecord } from '../entities/borrow_recoards.entity';

export interface BorrowRecordRepositoryInterface {
  create(borrowRecord: Partial<BorrowRecord>): Promise<BorrowRecord>;
  findActiveByUserAndBook(
    userId: string,
    bookId: string,
  ): Promise<BorrowRecord | null>;
  findActiveByUser(userId: string): Promise<BorrowRecord[]>;
  findActiveByBook(bookId: string): Promise<BorrowRecord[]>;
  findById(id: string): Promise<BorrowRecord | null>;
  borrowBook(
    bookId: string,
    userId: string,
    qty: number,
  ): Promise<{ book: Book; borrowRecord: BorrowRecord }>;
  returnBook(
    bookId: string,
    userId: string,
  ): Promise<{ book: Book; borrowRecord: BorrowRecord }>;
  getUserBorrowHistory(userId: string): Promise<BorrowRecord[]>;
  getBookBorrowHistory(bookId: string): Promise<BorrowRecord[]>;
}
