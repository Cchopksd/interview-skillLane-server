import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Body,
  Put,
  Delete,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { RequestBooksIdDto } from './dtos/request-books-id.dto';
import { RequestBooksDto } from './dtos/request-books.dto';
import { CreateBooksDto } from './dtos/create-books.dto';
import { UpdateBooksDto } from './dtos/update-books.dto';
import { QtyBooksDto } from './dtos/qty-books.dto';
import { UploadedImage } from 'src/common/decorators/file-validators.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('v1/books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  async findAll(@Query() dto: RequestBooksDto) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Books fetched successfully',
      data: this.booksService.findAll(dto),
    };
  }

  @Get(':id')
  async findOne(@Param('id') dto: RequestBooksIdDto) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Book fetched successfully',
      data: this.booksService.findOne(dto),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() dto: CreateBooksDto,
    @UploadedImage('cover') file: Express.Multer.File,
  ) {
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Book created successfully',
      data: this.booksService.create(dto, file),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') dto: RequestBooksIdDto,
    @Body() book: UpdateBooksDto,
    @UploadedImage('cover') file: Express.Multer.File,
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Book updated successfully',
      data: this.booksService.update(dto, book, file),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') dto: RequestBooksIdDto) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Book deleted successfully',
      data: this.booksService.delete(dto),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/borrow')
  async borrow(
    @Param('id') dto: RequestBooksIdDto,
    @Body() qty: QtyBooksDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return {
      statusCode: HttpStatus.OK,
      message: 'Book borrowed successfully',
      data: this.booksService.borrow(dto, qty, userId),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/return')
  async return(
    @Param('id') dto: RequestBooksIdDto,
    @Body() qty: QtyBooksDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return {
      statusCode: HttpStatus.OK,
      message: 'Book returned successfully',
      data: this.booksService.return(dto, qty, userId),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-borrows')
  async getMyBorrowHistory(@Request() req: any) {
    const userId = req.user.id;
    return {
      statusCode: HttpStatus.OK,
      message: 'User borrow history fetched successfully',
      data: this.booksService.getUserBorrowHistory(userId),
    };
  }

  @Get(':id/borrow-history')
  async getBookBorrowHistory(@Param('id') dto: RequestBooksIdDto) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Book borrow history fetched successfully',
      data: this.booksService.getBookBorrowHistory(dto),
    };
  }
}
