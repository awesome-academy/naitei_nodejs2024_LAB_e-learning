// lesson.dto.ts
import { IsNotEmpty, IsInt, IsOptional, IsEnum, IsString, IsNumber, Min, Max } from 'class-validator';
import { LessonType } from 'src/enum/lesson.enum';

export class LessonCreateDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progress!: number;

  @IsNotEmpty()
  @IsEnum(LessonType)
  type!: LessonType;

  @IsNotEmpty()
  @IsString()
  content!: string;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  time!: number;

  @IsNotEmpty()
  @IsInt()
  section_id!: number;
}

export class LessonUpdateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  @IsEnum(LessonType)
  type?: LessonType;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  time?: number;
}
