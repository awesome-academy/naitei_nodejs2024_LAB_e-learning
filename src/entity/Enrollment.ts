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

@Entity('enrollments')
export class Enrollment {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
      id!: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
      user!: User;

    @ManyToOne(() => Course)
    @JoinColumn({ name: 'course_id' })
      course!: Course;

      @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
      enrollment_date!: Date;

    @Column('integer')
      progress!: number;

    @Column({ type: 'datetime', nullable: true })
    completion_date!: Date | null;

    @Column({ type: 'bigint' })
      user_id!: number;

    @Column({ type: 'bigint' })
      course_id!: number;

    @CreateDateColumn({ type: 'datetime' })
      created_at!: Date;

    @UpdateDateColumn({ type: 'datetime' })
      updated_at!: Date;

    constructor(enrollmentData?: Partial<Enrollment>) {
      enrollmentData && Object.assign(this, enrollmentData);
    }
}
