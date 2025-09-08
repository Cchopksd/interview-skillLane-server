import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { BorrowRecord } from '../../books/entities/borrow_recoards.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  @Exclude()
  password: string;

  @OneToMany(() => BorrowRecord, (borrowRecord) => borrowRecord.user)
  borrowRecords: BorrowRecord[];
}
