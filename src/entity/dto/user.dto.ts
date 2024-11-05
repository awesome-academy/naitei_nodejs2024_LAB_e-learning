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
  role?: UserRoleType = UserRoleType.USER;

  @IsString()
  @Length(10, 15)
  phone_number!: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsDateString()
  date_of_birth!: Date;

  @IsEnum(UserGenderType)
  @IsOptional()
  gender?: UserGenderType = UserGenderType.MALE;

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
