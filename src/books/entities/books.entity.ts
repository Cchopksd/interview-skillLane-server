import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  coverImage: string;

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
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
