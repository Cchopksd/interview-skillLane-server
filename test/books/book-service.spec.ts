import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { BooksService } from '../../src/books/books.service';
import { BooksRepositoryInterface } from '../../src/books/interfaces/books.interface';
import { Book } from '../../src/books/entities/books.entity';

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

describe('BooksService (unit)', () => {
  let service: BooksService;
  let repo: jest.Mocked<BooksRepositoryInterface>;
  const baseBook: Book = {
    id: 'uuid',
    title: 'วิธีทำผัดกะเพรา',
    description: 'การทำผัดกะเพรา',
    coverImage: 'https://example.com/cover.jpg',
    author: 'ประยุทธ์ จันทร์โอชา',
    publicationYear: 2008,
    totalQuantity: 3,
    availableQuantity: 3,
    ISBN: '1234567890',
    createdAt: new Date('2020-01-01T00:00:00Z'),
    updatedAt: new Date('2020-01-01T00:00:00Z'),
  };

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01T00:00:00Z'));
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    repo = makeMockRepo();
    service = new BooksService(repo);
  });

  it('create: should set availableQuantity = totalQuantity', async () => {
    repo.create.mockResolvedValue(baseBook);

    const created = await service.create({
      title: baseBook.title,
      description: baseBook.description,
      coverImage: baseBook.coverImage,
      author: baseBook.author,
      publicationYear: baseBook.publicationYear,
      totalQuantity: baseBook.totalQuantity,
      ISBN: baseBook.ISBN,
    });

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
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      }),
    );
  });

  it('update: should update the book (partial), repo merges', async () => {
    repo.update.mockResolvedValue({
      ...baseBook,
      title: 'วิธีทำผัดผัก',
      description: 'การทำผัดผัก',
      coverImage: 'https://example.com/cover.jpg',
      author: 'สมชาย ยงใจยุทร',
      updatedAt: new Date('2020-01-01T00:00:00Z'),
    });

    const updated = await service.update(
      { id: 'uuid' },
      {
        title: 'วิธีทำผัดผัก',
        description: 'การทำผัดผัก',
        author: 'สมชาย ยงใจยุทร',
      },
    );

    expect(updated.title).toBe('วิธีทำผัดผัก');
    expect(updated.availableQuantity).toBe(3);
    expect(updated.totalQuantity).toBe(3);
    expect(repo.update).toHaveBeenCalledWith(
      'uuid',
      expect.objectContaining({
        title: 'วิธีทำผัดผัก',
        description: 'การทำผัดผัก',
        coverImage: 'https://example.com/cover.jpg',
        author: 'สมชาย ยงใจยุทร',
        updatedAt: expect.any(Date),
      }),
    );
  });

  it('borrow: decrements availableQuantity; conflict when not enough', async () => {
    repo.reduceStock.mockResolvedValue({
      ...baseBook,
      availableQuantity: 2,
      updatedAt: new Date('2020-01-01T00:00:00Z'),
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
      updatedAt: new Date('2020-01-01T00:00:00Z'),
    });

    const ok = await service.return({ id: 'uuid' }, { qty: 1 });
    expect(ok.availableQuantity).toBe(3);
    expect(ok.totalQuantity).toBe(3);
  });

  it('borrow/return: qty must be >= 1', async () => {
    await expect(
      service.borrow({ id: 'uuid' }, { qty: 0 }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.return({ id: 'uuid' }, { qty: -3 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('borrow: not found passthrough', async () => {
    repo.reduceStock.mockRejectedValue(new NotFoundException());
    await expect(
      service.borrow({ id: 'missing' }, { qty: 1 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
