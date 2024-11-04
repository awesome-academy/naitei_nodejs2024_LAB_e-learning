import { IsEmail, IsEnum, IsOptional, IsString, Length, IsDateString, IsInt } from 'class-validator';
import { UserRoleType, UserGenderType } from 'src/enum/user.enum';

export class UserRegisterDto {
  @IsString()
  @Length(2, 50)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Length(8, 20)
  password!: string;

  @IsEnum(UserRoleType)
  @IsOptional()
  role?: UserRoleType;

  @IsString()
  @Length(10, 15)
  phone_number!: string;

  @IsDateString()
  date_of_birth!: Date;

  @IsEnum(UserGenderType)
  @IsOptional()
  gender?: UserGenderType;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  identity_card?: string;

  @IsString()
  @IsOptional()
  additional_info?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsInt()
  @IsOptional()
  years_of_experience?: number;
}

export class UserLoginDto {
    @IsEmail()
    email!: string;
  
    @IsString()
    @Length(8, 20)
    password!: string;
  }

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(1, 50, { message: "Name must be between 1 and 50 characters" })
  name?: string;

  @IsOptional()
  @IsString()
  @Length(10, 15, { message: "Phone number must be between 10 and 15 characters" })
  phone_number?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsDateString({}, { message: "Date of birth must be a valid date" })
  date_of_birth?: string;

  @IsOptional()
  @IsEnum(UserGenderType, { message: `Gender must be either 'male', 'female', or 'other'` })
  gender?: UserGenderType;

  @IsOptional()
  @IsString()
  @Length(0, 100, { message: "Address cannot exceed 100 characters" })
  address?: string;

  @IsOptional()
  @IsString()
  @Length(0, 20, { message: "Identity card cannot exceed 20 characters" })
  identity_card?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500, { message: "Additional information cannot exceed 500 characters" })
  additional_info?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsInt({ message: "Years of experience must be a number" })
  years_of_experience?: number;
}
