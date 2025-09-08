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
  UseInterceptors,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { RequestBooksIdDto } from './dtos/request-books-id.dto';
import { RequestBooksDto } from './dtos/request-books.dto';
import { CreateBooksDto } from './dtos/create-books.dto';
import { UpdateBooksDto } from './dtos/update-books.dto';
import { UploadedImage } from 'src/common/decorators/file-validators.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('v1/books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  async findAll(@Query() dto: RequestBooksDto) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Books fetched successfully',
      data: await this.booksService.findAll(dto),
    };
  }

  @Get(':id')
  async findOne(@Param() dto: RequestBooksIdDto) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Book fetched successfully',
      data: await this.booksService.findOne(dto),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('cover'))
  async create(
    @Body() dto: CreateBooksDto,
    @UploadedImage() file: Express.Multer.File,
  ) {
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Book created successfully',
      data: await this.booksService.create(dto, file),
    };
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('cover'))
  @Put(':id')
  async update(
    @Param() dto: RequestBooksIdDto,
    @Body() book: UpdateBooksDto,
    @UploadedImage() file: Express.Multer.File,
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Book updated successfully',
      data: await this.booksService.update(dto, book, file),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param() dto: RequestBooksIdDto) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Book deleted successfully',
      data: await this.booksService.delete(dto),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/borrow')
  async borrow(@Param() dto: RequestBooksIdDto, @Request() req: any) {
    const userId = req.user.id;
    return {
      statusCode: HttpStatus.OK,
      message: 'Book borrowed successfully',
      data: await this.booksService.borrow(dto, userId),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/return')
  async return(@Param() dto: RequestBooksIdDto, @Request() req: any) {
    const userId = req.user.id;
    return {
      statusCode: HttpStatus.OK,
      message: 'Book returned successfully',
      data: await this.booksService.return(dto, userId),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-borrows')
  async getMyBorrowHistory(@Request() req: any) {
    const userId = req.user.id;
    return {
      statusCode: HttpStatus.OK,
      message: 'User borrow history fetched successfully',
      data: await this.booksService.getUserBorrowHistory(userId),
    };
  }

  @Get(':id/borrow-history')
  async getBookBorrowHistory(@Param() dto: RequestBooksIdDto) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Book borrow history fetched successfully',
      data: await this.booksService.getBookBorrowHistory(dto),
    };
  }
}
