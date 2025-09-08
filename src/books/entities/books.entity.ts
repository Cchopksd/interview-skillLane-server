import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BorrowRecord } from './borrow_recoards.entity';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ type: 'jsonb', default: { url: '', path: '' } })
  coverImage: { url: string; path: string };

  @Column()
  totalQuantity: number;

  @Column()
  availableQuantity: number;

  @Column()
  author: string;

  @Column({ unique: true })
  ISBN: string;

  @Column()
  publicationYear: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => BorrowRecord, (borrowRecord) => borrowRecord.book)
  borrowRecords: BorrowRecord[];
}
