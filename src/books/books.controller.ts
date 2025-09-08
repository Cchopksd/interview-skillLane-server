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
    return this.booksService.findAll(dto);
  }

  @Get(':id')
  async findOne(@Param('id') dto: RequestBooksIdDto) {
    return this.booksService.findOne(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() dto: CreateBooksDto,
    @UploadedImage('cover') file: Express.Multer.File,
  ) {
    return this.booksService.create(dto, file);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') dto: RequestBooksIdDto,
    @Body() book: UpdateBooksDto,
    @UploadedImage('cover') file: Express.Multer.File,
  ) {
    return this.booksService.update(dto, book, file);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') dto: RequestBooksIdDto) {
    return this.booksService.delete(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/borrow')
  async borrow(
    @Param('id') dto: RequestBooksIdDto,
    @Body() qty: QtyBooksDto,
    @Request() req: any,
  ) {
    const userId = req.user.id; // Extract user ID from JWT token
    return this.booksService.borrow(dto, qty, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/return')
  async return(
    @Param('id') dto: RequestBooksIdDto,
    @Body() qty: QtyBooksDto,
    @Request() req: any,
  ) {
    const userId = req.user.id; // Extract user ID from JWT token
    return this.booksService.return(dto, qty, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-borrows')
  async getMyBorrowHistory(@Request() req: any) {
    const userId = req.user.id; // Extract user ID from JWT token
    return this.booksService.getUserBorrowHistory(userId);
  }

  @Get(':id/borrow-history')
  async getBookBorrowHistory(@Param('id') dto: RequestBooksIdDto) {
    return this.booksService.getBookBorrowHistory(dto);
  }
}
