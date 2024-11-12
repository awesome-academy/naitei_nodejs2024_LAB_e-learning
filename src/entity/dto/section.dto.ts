import { IsString,IsEnum, IsNotEmpty, IsInt, Min, IsNumber, IsOptional, Max, Validate, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'isNotNumericString', async: false })
class IsNotNumericString implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    return isNaN(Number(text)); 
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} should not be a numeric value`;
  }
}

export class CreateSectionDto {
  @IsString()
  @IsNotEmpty()
  @Validate(IsNotNumericString, { message: 'Name should not be a numeric value' }) 
  name!: string;

}

export class UpdateSectionDto {
  @IsString()
  @IsNotEmpty()
  @Validate(IsNotNumericString, { message: 'Name should not be a numeric value' }) 
  name!: string;
}