import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './entities/books.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Book])],
  providers: [
    {
      provide: 'BOOK_REPOSITORY',
      useValue: Book,
    },
    BooksService,
  ],
  exports: [BooksService],
})
export class BooksModule {}
