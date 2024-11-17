import { Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  ManyToOne, 
  CreateDateColumn, 
  UpdateDateColumn, 
  JoinColumn 
} from 'typeorm';
import { User } from './User';
import { Course } from './Course';

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
      id!: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
      user!: User;

    @ManyToOne(() => Course)
    @JoinColumn({ name: 'course_id' })
      course!: Course;

    @Column('double')
      amount!: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    payment_date!: Date;

    @Column({
      type: 'enum',
      enum: ['pending', 'done'],
    })
      status!: string;

    @Column({ type: 'bigint' })
      user_id!: number;

    @Column({ type: 'bigint' })
      course_id!: number;

    @CreateDateColumn({ type: 'datetime' })
      created_at!: Date;

    @UpdateDateColumn({ type: 'datetime' })
      updated_at!: Date;

    constructor(paymentData?: Partial<Payment>) {
      paymentData && Object.assign(this, paymentData);
    }
}
