import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { User } from "./User";
import { Section } from "./Section";
import { Category } from "./Category";
import { Cart } from "./Cart";
import { CourseStatus } from "../enum/course.enum";
import { Enrollment } from "./Enrollment";

@Entity("courses")
export class Course {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "professor_id" })
  professor!: User;

  @ManyToOne(() => Category, (category) => category.courses)
  @JoinColumn({ name: "category_id" })
  category!: Category;

  @OneToMany(() => Section, (section) => section.course)
  sections!: Section[];

  @Column()
  name!: string;

  @Column("double")
  price!: number;

  @Column("text")
  description!: string;

  @Column({ type: "float", nullable: true })
  average_rating!: number;

  @Column({ type: "bigint" })
  professor_id!: number;

  @Column({ type: "bigint" })
  category_id!: number;

  @Column({
    type: "enum",
    enum: CourseStatus,
    default: CourseStatus.DRAFT,
  })
  status!: string;

  @CreateDateColumn({ type: "datetime" })
  created_at!: Date;

  @UpdateDateColumn({ type: "datetime" })
  updated_at!: Date;

  @OneToMany(() => Cart, (cart) => cart.course)
  cartItems!: Cart[];

  @OneToMany(() => Enrollment, enrollment => enrollment.user)
  enrollments!: Enrollment[];

  constructor(courseData?: Partial<Course>) {
    courseData && Object.assign(this, courseData);
  }
}
