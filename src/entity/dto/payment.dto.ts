import { IsArray, IsInt, IsNotEmpty, IsNumber, Min, IsEnum } from 'class-validator';

export class ProcessPaymentDto {
  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty()
  courseIds!: number[];
}

export class SubmitPaymentDto {
  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty()
  courseIds!: number[];
}

export class CreatePaymentDto {
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsEnum(['pending', 'done'])
  status!: string;
}