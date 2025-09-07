import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @Column()
  ISBN: string;

  @Column()
  publicationYear: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
