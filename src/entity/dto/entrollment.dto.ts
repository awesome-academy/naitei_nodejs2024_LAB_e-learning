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
