import { IsNotEmpty, IsOptional, IsString, IsInt, IsPositive } from 'class-validator';

export class CommentDTO {
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  review_id!: number;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  user_id!: number;

  @IsString()
  @IsNotEmpty()
  comment_text!: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  parent_id?: number;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  course_id!: number;
}

export class CreateCommentDto {
  @IsInt()
  @IsNotEmpty()
  review_id!: number;

  @IsInt()
  @IsOptional()
  parent_id?: number;

  @IsString()
  @IsNotEmpty()
  comment!: string;

  @IsInt()
  @IsNotEmpty()
  user_id!: number;
}
