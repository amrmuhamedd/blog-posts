import { IsEmail, IsEnum, IsString, Length, IsOptional } from "class-validator";

export enum role {
    ADMIN = 'ADMIN',
    USER = 'USER'
}

export class CreateCustomerInput {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @Length(7, 12)
    phone: string;

    @IsEnum(role)
    role: role;

    @Length(6, 12)
    password: string;

    @IsOptional()
    @IsString()
    profile_picture?: string;

    @IsOptional()
    @IsString()
    bio?: string;
}

export class LoginDto {
    @IsEmail()
    email: string;

    @IsString()
    @Length(6, 100)
    password: string;
}
