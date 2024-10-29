import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { Course } from './Course';

@Entity('carts')
export class Cart {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id!: number;

    @ManyToOne(() => User, (user) => user.cart)
    user!: User;

    @ManyToOne(() => Course, (course) => course.cartItems)
    course!: Course;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    constructor(cartData?: Partial<Cart>) {
        cartData && Object.assign(this, cartData);
      }
}
