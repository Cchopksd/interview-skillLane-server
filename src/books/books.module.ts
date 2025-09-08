import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { Book } from './entities/books.entity';
import { BorrowRecord } from './entities/borrow_recoards.entity';
import { User } from '../user/entity/user.entity';
import { BooksService } from './books.service';
import { BookRepository } from './repository/books.repository';
import { BorrowRecordRepository } from './repository/borrow-record.repository';
import { FileModule } from 'src/files/file.module';
import { UserModule } from '../user/user.module';
import { BooksController } from './books.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book, BorrowRecord, User]),
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
    FileModule,
    UserModule,
  ],
  controllers: [BooksController],
  providers: [
    { provide: 'BOOK_REPOSITORY', useClass: BookRepository },
    { provide: 'BORROW_RECORD_REPOSITORY', useClass: BorrowRecordRepository },
    BooksService,
  ],
  exports: [
    BooksService,
    { provide: 'BOOK_REPOSITORY', useClass: BookRepository },
    { provide: 'BORROW_RECORD_REPOSITORY', useClass: BorrowRecordRepository },
  ],
})
export class BooksModule {}
