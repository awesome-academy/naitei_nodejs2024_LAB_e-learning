import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './User';
import { Section } from './Section';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'professor_id' })
  professor!: User;

  @OneToMany(() => Section, (section) => section.course)
  sections!: Section[];

  @Column()
  name!: string;

  @Column('double')
  price!: number;

  @Column('text')
  description!: string;

  @Column('float')
  average_rating!: number;

  @Column({ type: 'bigint' })
  professor_id!: number;

  @CreateDateColumn({ type: 'datetime' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at!: Date;

  constructor(courseData?: Partial<Course>) {
    courseData && Object.assign(this, courseData);
  }
}

