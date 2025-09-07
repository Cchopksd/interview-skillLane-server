import { ConflictException, NotFoundException } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksRepositoryInterface } from './interfaces/books.interface';
import { Book } from './entities/books.entity';
import { FileService } from '../files/file.service';
import { Readable } from 'stream';

function makeMockRepo(): jest.Mocked<BooksRepositoryInterface> {
  return {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    reduceStock: jest.fn(),
    increaseStock: jest.fn(),
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
  let repo: jest.Mocked<BooksRepositoryInterface>;
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
    repo = makeMockRepo();
    fileService = makeMockFileService();
    service = new BooksService(repo, fileService as any);
  });

  it('create: should set availableQuantity = totalQuantity', async () => {
    repo.create.mockResolvedValue(baseBook);

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
    expect(repo.create).toHaveBeenCalledWith(
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
    repo.findOne?.mockResolvedValue?.(baseBook);

    repo.update.mockResolvedValue({
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
    expect(repo.update).toHaveBeenCalledWith(
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

  it('borrow: decrements availableQuantity; conflict when not enough', async () => {
    repo.reduceStock.mockResolvedValue({
      ...baseBook,
      availableQuantity: 2,
    });

    const ok = await service.borrow({ id: 'uuid' }, { qty: 1 });
    expect(ok.availableQuantity).toBe(2);
    expect(ok.totalQuantity).toBe(3);
    expect(repo.reduceStock).toHaveBeenCalledWith('uuid', 1);

    repo.reduceStock.mockRejectedValueOnce(
      new ConflictException('Not enough copies'),
    );
    await expect(
      service.borrow({ id: 'uuid' }, { qty: 10 }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('return: increments availableQuantity but not over totalQuantity', async () => {
    repo.increaseStock.mockResolvedValue({
      ...baseBook,
      availableQuantity: 3,
    });

    const ok = await service.return({ id: 'uuid' }, { qty: 1 });
    expect(ok.availableQuantity).toBe(3);
    expect(ok.totalQuantity).toBe(3);
  });

  it('borrow: not found passthrough', async () => {
    repo.reduceStock.mockRejectedValue(new NotFoundException());
    await expect(
      service.borrow({ id: 'missing' }, { qty: 1 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
