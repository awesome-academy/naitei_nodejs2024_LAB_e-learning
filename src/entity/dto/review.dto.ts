import { IsNotEmpty, IsInt, IsNumber, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  @IsNotEmpty()
  user_id!: number;

  @IsInt()
  @IsNotEmpty()
  course_id!: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;
}
