import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './entities/books.entity';
import { BooksService } from './books.service';
import { BookRepository } from './repository/books.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Book])],
  providers: [
    { provide: 'BOOK_REPOSITORY', useClass: BookRepository },
    BooksService,
  ],
  exports: [
    BooksService,
    { provide: 'BOOK_REPOSITORY', useClass: BookRepository },
  ],
})
export class BooksModule {}
