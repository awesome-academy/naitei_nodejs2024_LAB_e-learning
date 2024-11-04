import { IsString, IsNumber, IsOptional, IsEnum, Min, Max, IsNotEmpty } from 'class-validator';
import { CourseStatus, CourseSortingFields } from 'src/enum/course.enum';

export class CreateCourseDto {
    @IsString()
    @IsNotEmpty()
    name!: string;
  
    @IsString()
    @IsNotEmpty()
    description!: string;
  
    @IsNumber()
    @Min(0)
    price!: number;
  
    @IsNumber()
    @IsNotEmpty()
    category_id!: number;
  
    @IsNumber()
    @IsOptional()
    @Min(0)
    @Max(5)
    average_rating?: number;
  }

  export class UpdateCourseDto {
    @IsOptional()
    @IsString()
    name?: string;
  
    @IsOptional()
    @IsString()
    description?: string;
  
    @IsOptional()
    @IsNumber()
    @Min(0)
    price?: number;
  
    @IsOptional()
    @IsNumber()
    category_id?: number;
  
    @IsOptional()
    @IsNumber()
    average_rating?: number;
  }
  

export class FilterCourseDto {
    @IsOptional()
    @IsNumber()
    @Min(0)
    minPrice?: number;
  
    @IsOptional()
    @IsNumber()
    @Min(0)
    maxPrice?: number;
  
    @IsOptional()
    @IsNumber()
    @Min(0)
    minRating?: number;
  
    @IsOptional()
    @IsString()
    courseName?: string;
  
    @IsOptional()
    @IsString()
    category?: string;
  
    @IsOptional()
    @IsEnum(CourseSortingFields)
    sortBy?: CourseSortingFields;
  
    @IsOptional()
    @IsEnum(['ASC', 'DESC'])
    sortOrder?: 'ASC' | 'DESC';
  }
