import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BooksServiceInterface } from './interfaces/books-service.interface';
import { CreateBooksDto } from './dtos/create-books.dto';
import { UpdateBooksDto } from './dtos/update-books.dto';
import { RequestBooksIdDto } from './dtos/request-books-id.dto';
import { RequestBooksDto } from './dtos/request-books.dto';
import { Paginated, PaginationMeta } from '@utils/pagination-cal.util';
import { QtyBooksDto } from './dtos/qty-books.dto';
import { BooksRepositoryInterface } from './interfaces/books.interface';
import { BorrowRecordRepositoryInterface } from './repository/borrow-record.repository';
import { Book } from './entities/books.entity';
import { BorrowRecord } from './entities/borrow_recoards.entity';
import { FileService } from '../files/file.service';

@Injectable()
export class BooksService implements BooksServiceInterface {
  constructor(
    @Inject('BOOK_REPOSITORY')
    private readonly booksRepository: BooksRepositoryInterface,
    @Inject('BORROW_RECORD_REPOSITORY')
    private readonly borrowRecordRepository: BorrowRecordRepositoryInterface,
    private readonly fileService: FileService,
  ) {}

  async findOne(dto: RequestBooksIdDto) {
    const book = await this.booksRepository.findOne(dto.id);
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  async findAll(dto: RequestBooksDto): Promise<Paginated<Book[]>> {
    const { books, total } = await this.booksRepository.findAll(
      dto.page,
      dto.limit,
      dto.search,
    );
    const meta = PaginationMeta(dto.page, dto.limit, total);
    return { meta, data: books };
  }

  async create(dto: CreateBooksDto, file?: Express.Multer.File | null) {
    const coverImage = file && (await this.fileService.uploadFile(file));

    const bookData = {
      ...dto,
      availableQuantity: dto.totalQuantity,
      coverImage: coverImage,
    } as Book;

    const book = await this.booksRepository.create(bookData);
    return book;
  }

  async update(
    { id }: RequestBooksIdDto,
    dto: UpdateBooksDto,
    file?: Express.Multer.File | null,
  ) {
    const existingBook = await this.booksRepository.findOne(id);
    if (!existingBook) throw new NotFoundException('Book not found');

    const coverImage = file && (await this.fileService.uploadFile(file));

    const bookData = {
      ...dto,
      ...(coverImage && { coverImage }),
    } as Book;

    const updatedBook = await this.booksRepository.update(id, bookData);
    return updatedBook;
  }

  async delete({ id }: RequestBooksIdDto) {
    const existingBook = await this.booksRepository.findOne(id);
    if (!existingBook) throw new NotFoundException('Book not found');
    await this.booksRepository.delete(id);
  }

  async borrow({ id }: RequestBooksIdDto, dto: QtyBooksDto, userId: string) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const result = await this.borrowRecordRepository.borrowBook(
      id,
      userId,
      dto.qty,
      7,
    );
    return result.book;
  }

  async return({ id }: RequestBooksIdDto, dto: QtyBooksDto, userId: string) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const result = await this.borrowRecordRepository.returnBook(
      id,
      userId,
      dto.qty,
    );
    return result.book;
  }

  async getUserBorrowHistory(userId: string): Promise<BorrowRecord[]> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    return this.borrowRecordRepository.getUserBorrowHistory(userId);
  }

  async getBookBorrowHistory({
    id,
  }: RequestBooksIdDto): Promise<BorrowRecord[]> {
    return this.borrowRecordRepository.getBookBorrowHistory(id);
  }
}
