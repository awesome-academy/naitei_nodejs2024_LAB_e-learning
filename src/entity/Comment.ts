import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Review } from "./Review";
import { User } from "./User";

@Entity("comments")
export class Comment {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id!: number;

  @ManyToOne(() => Review)
  @JoinColumn({ name: "review_id" })
  review!: Review;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ type: "bigint", nullable: true })
  parent_id!: number;

  @Column("text")
  comment_text!: string;

  @Column({ type: "bigint" })
  user_id!: number;

  @Column({ type: "bigint" })
  review_id!: number;

  @CreateDateColumn({ type: "datetime" })
  created_at!: Date;

  @UpdateDateColumn({ type: "datetime" })
  updated_at!: Date;

  constructor(commentData?: Partial<Comment>) {
    commentData && Object.assign(this, commentData);
  }
}
