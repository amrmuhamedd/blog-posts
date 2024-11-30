import { IsString, IsEmail, IsEnum, IsOptional, MinLength, MaxLength } from 'class-validator';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  phone: string;

  @IsEnum(UserRole)
  role!: UserRole;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  bio?: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}
