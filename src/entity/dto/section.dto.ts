import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateSectionDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  course_id!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  total_time!: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  total_lesson!: number | null;
}

export class UpdateSectionDto {
  @IsNotEmpty()
  @IsInt()
  id!: number;

  @IsOptional()
  @IsString()
  name!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  total_time!: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  total_lesson!: number | null;
}
