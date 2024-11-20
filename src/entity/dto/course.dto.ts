import { IsString,IsEnum, IsNotEmpty, IsInt, Min, IsNumber, IsOptional, Max, Validate, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { CourseStatus, CourseSortingFields } from '../../enum/course.enum';

@ValidatorConstraint({ name: 'isNotNumericString', async: false })
class IsNotNumericString implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    return isNaN(Number(text)); 
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} should not be a numeric value`;
  }
}

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  @Validate(IsNotNumericString, { message: 'Name should not be a numeric value' })
  name!: string;

  @IsEnum(CourseStatus)
  @IsOptional()
  status?: CourseStatus;

  @IsString()
  @IsNotEmpty()
  @Validate(IsNotNumericString, { message: 'Description should not be a numeric value' }) 
  description!: string;

  @IsInt()
  @Min(0, { message: 'Price must be a non-negative integer' }) 
  price!: number;

  @IsNumber()
  @IsNotEmpty()
  category_id!: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(5)
  average_rating?: number;

  @IsNumber()
  @IsOptional()
  professor_id?: number
}

export class UpdateCourseDto {
  @IsString()
  @IsNotEmpty()
  @Validate(IsNotNumericString, { message: 'Name should not be a numeric value' })
  name!: string;

  @IsString()
  @IsNotEmpty()
  @Validate(IsNotNumericString, { message: 'Description should not be a numeric value' })
  description!: string;

  @IsInt()
  @Min(0, { message: 'Price must be a non-negative integer' }) 
  price!: number;

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
