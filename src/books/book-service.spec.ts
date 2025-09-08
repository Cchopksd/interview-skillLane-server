import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksRepositoryInterface } from './interfaces/books.interface';
import { BorrowRecordRepositoryInterface } from './repository/borrow-record.repository';
import { Book } from './entities/books.entity';
import { BorrowRecord } from './entities/borrow_recoards.entity';
import { User } from '../user/entity/user.entity';
import { FileService } from '../files/file.service';
import { Readable } from 'stream';

function makeMockBookRepo(): jest.Mocked<BooksRepositoryInterface> {
  return {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    updateStock: jest.fn(),
  };
}

function makeMockBorrowRecordRepo(): jest.Mocked<BorrowRecordRepositoryInterface> {
  return {
    create: jest.fn(),
    findActiveByUserAndBook: jest.fn(),
    findActiveByUser: jest.fn(),
    findActiveByBook: jest.fn(),
    findById: jest.fn(),
    borrowBook: jest.fn(),
    returnBook: jest.fn(),
    getUserBorrowHistory: jest.fn(),
    getBookBorrowHistory: jest.fn(),
  };
}

function makeMockFileService(): jest.Mocked<Pick<FileService, 'uploadFile'>> {
  return {
    uploadFile: jest.fn().mockResolvedValue({
      url: 'https://example.com/cover.jpg',
      path: 'cover.jpg',
    }),
  };
}

describe('BooksService (unit)', () => {
  let service: BooksService;
  let bookRepo: jest.Mocked<BooksRepositoryInterface>;
  let borrowRecordRepo: jest.Mocked<BorrowRecordRepositoryInterface>;
  let fileService: jest.Mocked<Pick<FileService, 'uploadFile'>>;

  const baseBook: Book = {
    id: 'uuid',
    title: 'วิธีทำผัดกะเพรา',
    description: 'การทำผัดกะเพรา',
    coverImage: {
      url: 'https://example.com/cover.jpg',
      path: 'cover.jpg',
    },
    author: 'ประยุทธ์ จันทร์โอชา',
    publicationYear: 2008,
    totalQuantity: 3,
    availableQuantity: 3,
    ISBN: '1234567890',
    createdAt: new Date('2020-01-01T00:00:00Z'),
    updatedAt: new Date('2020-01-01T00:00:00Z'),
    borrowRecords: [],
  };

  const baseUser: User = {
    id: 'user-uuid',
    username: 'testuser',
    password: 'hashedpassword',
    borrowRecords: [],
  };

  const baseBorrowRecord: BorrowRecord = {
    id: 'borrow-uuid',
    user: baseUser,
    book: baseBook,
    borrowedAt: new Date('2020-01-01T00:00:00Z'),
    dueDate: new Date('2020-01-08T00:00:00Z'),
    returnedAt: null,
    createdAt: new Date('2020-01-01T00:00:00Z'),
    updatedAt: new Date('2020-01-01T00:00:00Z'),
  };

  const file = {
    originalname: 'cover.jpg',
    buffer: Buffer.from(''),
    fieldname: 'cover',
    encoding: '7bit',
    mimetype: 'image/jpg',
    size: 100,
    stream: new Readable(),
    destination: '',
    filename: 'cover.jpg',
    path: 'cover.jpg',
  };

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01T00:00:00Z'));
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    bookRepo = makeMockBookRepo();
    borrowRecordRepo = makeMockBorrowRecordRepo();
    fileService = makeMockFileService();
    service = new BooksService(bookRepo, borrowRecordRepo, fileService as any);
  });

  it('create: should set availableQuantity = totalQuantity', async () => {
    bookRepo.create.mockResolvedValue(baseBook);

    const created = await service.create(
      {
        title: baseBook.title,
        description: baseBook.description,
        author: baseBook.author,
        publicationYear: baseBook.publicationYear,
        totalQuantity: baseBook.totalQuantity,
        ISBN: baseBook.ISBN,
      },
      file,
    );

    expect(fileService.uploadFile).toHaveBeenCalledWith(file);

    expect(created.availableQuantity).toBe(3);
    expect(bookRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: baseBook.title,
        description: baseBook.description,
        coverImage: baseBook.coverImage,
        author: baseBook.author,
        publicationYear: baseBook.publicationYear,
        totalQuantity: baseBook.totalQuantity,
        availableQuantity: baseBook.totalQuantity,
        ISBN: baseBook.ISBN,
      }),
    );
    expect(created.createdAt).toBeInstanceOf(Date);
    expect(created.updatedAt).toBeInstanceOf(Date);
  });

  it('update: should update the book (partial), repo merges', async () => {
    bookRepo.findOne?.mockResolvedValue?.(baseBook);

    bookRepo.update.mockResolvedValue({
      ...baseBook,
      title: 'วิธีทำผัดผัก',
      description: 'การทำผัดผัก',
      coverImage: { url: 'https://example.com/cover.jpg', path: 'cover.jpg' },
      author: 'สมชาย ยงใจยุทร',
    });

    const updated = await service.update(
      { id: 'uuid' },
      {
        title: 'วิธีทำผัดผัก',
        description: 'การทำผัดผัก',
        author: 'สมชาย ยงใจยุทร',
      },
      file,
    );

    expect(fileService.uploadFile).toHaveBeenCalledWith(file);

    expect(updated.title).toBe('วิธีทำผัดผัก');
    expect(updated.availableQuantity).toBe(3);
    expect(updated.totalQuantity).toBe(3);
    expect(bookRepo.update).toHaveBeenCalledWith(
      'uuid',
      expect.objectContaining({
        title: 'วิธีทำผัดผัก',
        description: 'การทำผัดผัก',
        coverImage: {
          url: 'https://example.com/cover.jpg',
          path: 'cover.jpg',
        },
        author: 'สมชาย ยงใจยุทร',
      }),
    );
    expect(updated.updatedAt).toBeInstanceOf(Date);
  });

  it('borrow: should borrow book with user tracking', async () => {
    const borrowedBook = { ...baseBook, availableQuantity: 2 };
    borrowRecordRepo.borrowBook.mockResolvedValue({
      book: borrowedBook,
      borrowRecord: baseBorrowRecord,
    });

    const result = await service.borrow(
      { id: 'uuid' },
      { qty: 1 },
      'user-uuid',
    );

    expect(result.availableQuantity).toBe(2);
    expect(borrowRecordRepo.borrowBook).toHaveBeenCalledWith(
      'uuid',
      'user-uuid',
      1,
      7,
    );
  });

  it('borrow: should throw error when userId is missing', async () => {
    await expect(
      service.borrow({ id: 'uuid' }, { qty: 1 }, ''),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('return: should return book with user tracking', async () => {
    const returnedBook = { ...baseBook, availableQuantity: 3 };
    borrowRecordRepo.returnBook.mockResolvedValue({
      book: returnedBook,
      borrowRecord: { ...baseBorrowRecord, returnedAt: new Date() },
    });

    const result = await service.return(
      { id: 'uuid' },
      { qty: 1 },
      'user-uuid',
    );

    expect(result.availableQuantity).toBe(3);
    expect(borrowRecordRepo.returnBook).toHaveBeenCalledWith(
      'uuid',
      'user-uuid',
      1,
    );
  });

  it('return: should throw error when userId is missing', async () => {
    await expect(
      service.return({ id: 'uuid' }, { qty: 1 }, ''),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('getUserBorrowHistory: should return user borrow history', async () => {
    const borrowHistory = [baseBorrowRecord];
    borrowRecordRepo.getUserBorrowHistory.mockResolvedValue(borrowHistory);

    const result = await service.getUserBorrowHistory('user-uuid');

    expect(result).toEqual(borrowHistory);
    expect(borrowRecordRepo.getUserBorrowHistory).toHaveBeenCalledWith(
      'user-uuid',
    );
  });
});
