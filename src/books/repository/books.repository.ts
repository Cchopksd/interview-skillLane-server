import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Book } from '../entities/books.entity';
import { BooksRepositoryInterface } from '../interfaces/books.interface';

@Injectable()
export class BookRepository implements BooksRepositoryInterface {
  constructor(
    @InjectRepository(Book) private readonly repository: Repository<Book>,
  ) {}

  async findOne(id: string): Promise<Book | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findAll(
    page = 1,
    limit = 10,
    search = '',
  ): Promise<{ books: Book[]; total: number }> {
    const term = (search ?? '').trim();
    const where = term
      ? [
          { title: Like(`%${term}%`) },
          { author: Like(`%${term}%`) },
          { ISBN: Like(`%${term}%`) },
        ]
      : undefined;

    const [books, total] = await this.repository.findAndCount({
      skip: (Math.max(page, 1) - 1) * Math.max(limit, 1),
      take: Math.max(limit, 1),
      where,
      order: { updatedAt: 'DESC' },
    });

    return { books, total };
  }

  async create(book: Book): Promise<Book> {
    if (await this.isbnExists(book.ISBN)) {
      throw new ConflictException('ISBN already exists');
    }

    const newBook = this.repository.create(book);

    return this.repository.save(newBook);
  }

  async update(id: string, book: Book): Promise<Book> {
    const existing = await this.repository.findOne({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Book not found');
    }
    if (await this.isbnExists(book.ISBN)) {
      throw new ConflictException('ISBN already exists');
    }

    const merged = this.repository.merge(existing, book);
    return this.repository.save(merged);
  }

  async delete(id: string): Promise<void> {
    const res = await this.repository.delete(id);
    if (!res.affected) {
      throw new NotFoundException('Book not found');
    }
  }

  async updateStock(id: string, qty: number): Promise<Book> {
    return this.repository.manager.transaction(async (manager) => {
      const bookRepo = manager.getRepository(Book);
      const book = await bookRepo.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!book) throw new NotFoundException('Book not found');

      const next = book.availableQuantity + qty;
      if (next < 0) {
        throw new ConflictException('Book stock is not enough');
      }
      if (next > book.totalQuantity) {
        throw new ConflictException('Book stock is full');
      }

      book.availableQuantity = next;
      return bookRepo.save(book);
    });
  }

  private async isbnExists(isbn: string): Promise<boolean> {
    const existing = await this.repository.findOne({ where: { ISBN: isbn } });
    return !!existing;
  }
}
