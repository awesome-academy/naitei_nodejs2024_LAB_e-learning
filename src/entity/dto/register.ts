// import { IsNotEmpty, IsEmail, IsString, Length, IsIn, IsDateString, Matches, IsOptional, IsInt, Min } from 'class-validator';
// import i18n from '../../i18n';

// const getMessage = (key: string) => i18n.__({ phrase: key });

// export class RegisterDto {
//   @IsNotEmpty({ message: getMessage('validation.name_required') })
//   @Length(3, 50, { message: getMessage('validation.name_length') })
//   name!: string;

//   @IsEmail({}, { message: getMessage('validation.email_invalid') })
//   @IsNotEmpty({ message: getMessage('validation.email_required') })
//   email!: string;

//   @IsNotEmpty({ message: getMessage('validation.phone_required') })
//   @Matches(/^\d{10,15}$/, { message: getMessage('validation.phone_invalid') })
//   phone_number!: string;

//   @IsNotEmpty({ message: getMessage('validation.dob_required') })
//   @IsDateString({}, { message: getMessage('validation.dob_invalid') })
//   date_of_birth!: string;

//   @IsNotEmpty({ message: getMessage('validation.gender_required') })
//   @IsIn(['male', 'female', 'other'], { message: getMessage('validation.gender_invalid') })
//   gender!: string;

//   @IsNotEmpty({ message: getMessage('validation.address_required') })
//   @Length(0, 100, { message: getMessage('validation.address_length') })
//   address!: string;

//   @IsNotEmpty({ message: getMessage('validation.role_required') })
//   @IsIn(['user', 'professor'], { message: getMessage('validation.role_invalid') })
//   role!: string;

//   @IsOptional()
//   @IsNotEmpty({ message: getMessage('validation.department_required') })
//   @Length(0, 50, { message: getMessage('validation.department_length') })
//   department?: string;

//   @IsOptional()
//   @IsNotEmpty({ message: getMessage('validation.experience_required') })
//   @IsInt({ message: getMessage('validation.experience_invalid') })
//   @Min(0, { message: getMessage('validation.experience_negative') })
//   years_of_experience?: number;

//   @IsNotEmpty({ message: getMessage('validation.password_required') })
//   @Length(6, undefined, { message: getMessage('validation.password_length') })
//   @Matches(/[A-Z]/, { message: getMessage('validation.password_uppercase') })
//   @Matches(/[0-9]/, { message: getMessage('validation.password_number') })
//   password!: string;

//   @IsNotEmpty({ message: getMessage('validation.id_required') })
//   @Length(9, 12, { message: getMessage('validation.id_length') })
//   identity_card!: string;
// }
