import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { BorrowRecord } from '../entities/borrow_recoards.entity';
import { Book } from '../entities/books.entity';
import { User } from '../../user/entity/user.entity';
import { BorrowRecordRepositoryInterface } from '../interfaces/borrow.interface';

@Injectable()
export class BorrowRecordRepository implements BorrowRecordRepositoryInterface {
  constructor(
    @InjectRepository(BorrowRecord)
    private readonly repository: Repository<BorrowRecord>,
  ) {}

  async create(borrowRecord: Partial<BorrowRecord>): Promise<BorrowRecord> {
    const newRecord = this.repository.create(borrowRecord);
    return this.repository.save(newRecord);
  }

  async findActiveByUserAndBook(
    userId: string,
    bookId: string,
  ): Promise<BorrowRecord | null> {
    return this.repository.findOne({
      where: {
        user: { id: userId },
        book: { id: bookId },
        returnedAt: IsNull(),
      },
      relations: ['user', 'book'],
    });
  }

  async findActiveByUser(userId: string): Promise<BorrowRecord[]> {
    return this.repository.find({
      where: {
        user: { id: userId },
        returnedAt: IsNull(),
      },
      relations: ['book'],
    });
  }

  async findActiveByBook(bookId: string): Promise<BorrowRecord[]> {
    return this.repository.find({
      where: {
        book: { id: bookId },
        returnedAt: IsNull(),
      },
      relations: ['user'],
    });
  }

  async findById(id: string): Promise<BorrowRecord | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['user', 'book'],
    });
  }

  async borrowBook(
    bookId: string,
    userId: string,
    days: number,
  ): Promise<{ book: Book; borrowRecord: BorrowRecord }> {
    return this.repository.manager.transaction(async (manager) => {
      const bookRepo = manager.getRepository(Book);
      const borrowRecordRepo = manager.getRepository(BorrowRecord);
      const userRepo = manager.getRepository(User);

      const book = await bookRepo.findOne({
        where: { id: bookId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!book) throw new NotFoundException('Book not found');

      const user = await userRepo.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

      const existingBorrow = await borrowRecordRepo.findOne({
        where: {
          user: { id: userId },
          book: { id: bookId },
          returnedAt: IsNull(),
        },
      });
      if (existingBorrow) {
        throw new ConflictException(
          'User already has an active borrow for this book',
        );
      }

      const next = book.availableQuantity - 1;
      if (next < 0) {
        throw new ConflictException('Book stock is not enough');
      }

      book.availableQuantity = next;
      const updatedBook = await bookRepo.save(book);

      const borrowedAt = new Date();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + days);

      const borrowRecord = borrowRecordRepo.create({
        user,
        book: updatedBook,
        borrowedAt,
        dueDate,
      });
      const savedBorrowRecord = await borrowRecordRepo.save(borrowRecord);

      return { book: updatedBook, borrowRecord: savedBorrowRecord };
    });
  }

  async returnBook(
    bookId: string,
    userId: string,
  ): Promise<{ book: Book; borrowRecord: BorrowRecord }> {
    return this.repository.manager.transaction(async (manager) => {
      const bookRepo = manager.getRepository(Book);
      const borrowRecordRepo = manager.getRepository(BorrowRecord);

      const book = await bookRepo.findOne({
        where: { id: bookId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!book) throw new NotFoundException('Book not found');

      const borrowRecord = await borrowRecordRepo.findOne({
        where: {
          user: { id: userId },
          book: { id: bookId },
          returnedAt: IsNull(),
        },
        relations: ['user', 'book'],
      });
      if (!borrowRecord) {
        throw new NotFoundException(
          'No active borrow record found for this book',
        );
      }

      const next = book.availableQuantity + 1;
      if (next > book.totalQuantity) {
        throw new ConflictException('Book stock is full');
      }
      book.availableQuantity = next;
      const updatedBook = await bookRepo.save(book);

      borrowRecord.returnedAt = new Date();
      const updatedBorrowRecord = await borrowRecordRepo.save(borrowRecord);

      return { book: updatedBook, borrowRecord: updatedBorrowRecord };
    });
  }

  async getBookBorrowHistory(
    bookId: string,
    userId: string,
  ): Promise<BorrowRecord | null> {
    return this.repository.findOne({
      where: {
        book: { id: bookId },
        user: { id: userId },
        returnedAt: IsNull(),
      },
      relations: ['user', 'book'],
    });
  }
}
