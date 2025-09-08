import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { Book } from './books.entity';

@Entity('borrow_records')
export class BorrowRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.borrowRecords, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Book, (book) => book.borrowRecords, { onDelete: 'CASCADE' })
  book: Book;

  @Column({ type: 'timestamp' })
  borrowedAt: Date;

  @Column({ type: 'timestamp' })
  dueDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  returnedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
