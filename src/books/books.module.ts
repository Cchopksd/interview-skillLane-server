import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './entities/books.entity';
import { BooksService } from './books.service';
import { BookRepository } from './repository/books.repository';
import { FileModule } from 'src/files/file.module';
import { BooksController } from './books.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Book]), FileModule],
  controllers: [BooksController],
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
