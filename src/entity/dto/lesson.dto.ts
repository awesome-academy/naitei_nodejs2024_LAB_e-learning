import { Validate, IsNotEmpty, IsInt, IsOptional, IsEnum, IsString, IsNumber, Min, Max, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { LessonType } from 'src/enum/lesson.enum';

@ValidatorConstraint({ name: 'isNotNumericString', async: false })
class IsNotNumericString implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    return isNaN(Number(text)); 
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} should not be a numeric value`;
  }
}

export class LessonCreateDto {
  @IsString()
  @IsNotEmpty()
  @Validate(IsNotNumericString, { message: 'Name should not be a numeric value' }) 
  name!: string;

  @IsNotEmpty()
  @IsEnum(LessonType)
  type!: LessonType;

  @IsString()
  @IsNotEmpty()
  @Validate(IsNotNumericString, { message: 'Content should not be a numeric value' }) 
  content!: string;

  @IsString()
  @IsNotEmpty()
  @Validate(IsNotNumericString, { message: 'Description should not be a numeric value' }) 
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
  @IsString()
  @IsNotEmpty()
  @Validate(IsNotNumericString, { message: 'Name should not be a numeric value' }) 
  name?: string;

  @IsOptional()
  @IsEnum(LessonType)
  type?: LessonType;

  @IsString()
  @IsNotEmpty()
  @Validate(IsNotNumericString, { message: 'Content should not be a numeric value' }) 
  content?: string;

  @IsString()
  @IsNotEmpty()
  @Validate(IsNotNumericString, { message: 'Description should not be a numeric value' }) 
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  time?: number;
}