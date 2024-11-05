import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("enrollmentlesson")
export class Enrollmentlesson {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id!: number;

  @Column()
  lesson_id!: number;

  @Column()
  enrollment_id!: number;

  @Column()
  progress!: number;

  @CreateDateColumn({ type: "datetime" })
  created_at!: Date;

  @UpdateDateColumn({ type: "datetime" })
  updated_at!: Date;

  constructor(enrollmenlessontData?: Partial<Enrollmentlesson>) {
    enrollmenlessontData && Object.assign(this, enrollmenlessontData);
  }
}
