import { IsNotEmpty, IsInt, IsPositive } from 'class-validator';

export class CartDTO {
    @IsInt()
    @IsNotEmpty()
    userId!: number;
}

export class addItemToCartDTO {
    @IsInt()
    @IsNotEmpty()
    userId!: number;

    @IsInt()
    @IsPositive()
    courseId!: number;
}