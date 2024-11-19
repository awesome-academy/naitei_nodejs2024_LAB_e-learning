import { IsInt, IsNotEmpty, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class GetUserCourseEnrollmentsDto {
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  courseId!: number;
}

export class UpdateLessonProgressDto {
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  courseId!: number;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  lessonId!: number;
}

export class CreateEnrollmentDto {
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  user_id!: number;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  course_id!: number;

  @IsNotEmpty()
  @Type(() => Date)
  enrollment_date!: Date;

  @IsOptional()
  @Type(() => Date)
  completion_date?: Date | null;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  progress!: number;
}