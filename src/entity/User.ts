import { Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany 
} from 'typeorm';
import { UserRoleType, UserGenderType } from '../enum/user.enum';
import { Cart } from './Cart';
import { Review } from './Review';
import { Enrollment } from './Enrollment';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
      id!: number;

    @Column()
      name!: string;

    @Column()
      email!: string;

    @Column()
      password!: string;

    @Column({
      type: 'enum',
      enum: UserRoleType,
      default: 'user',
    })
      role!: string;

    @Column() 
    phone_number!: string;

    @Column({ nullable: true }) 
    avatar!: string;

    @Column({ type: 'date'}) 
    date_of_birth!: Date;

    @Column({ 
      type: 'enum',
      enum: UserGenderType,
      default: 'male',
    }) 
    gender!: string; 

    @Column({ nullable: true }) 
    address!: string;

    @Column({ nullable: true }) 
    identity_card!: string;

    @Column({ type: 'text', nullable: true }) 
    additional_info!: string;

    @Column({ nullable: true }) department!: string;
    @Column({ nullable: true }) years_of_experience!: number;

    @CreateDateColumn({ type: 'datetime' })
      created_at!: Date;

    @UpdateDateColumn({ type: 'datetime' })
      updated_at!: Date;

    @OneToMany(() => Cart, (cart) => cart.user)
    cart!: Cart[];

    @OneToMany(() => Review, (review) => review.user)
    review!: Review[];

    @OneToMany(() => Enrollment, enrollment => enrollment.user)
    enrollments!: Enrollment[];

    constructor(userData?: Partial<User>) {
      userData && Object.assign(this, userData);
    }
}
