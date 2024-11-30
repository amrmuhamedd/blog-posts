import { IsString, IsNotEmpty, IsOptional, Length } from "class-validator";

export class CreatePostDto {
    @IsString()
    @IsNotEmpty({ message: "You must enter a title for post" })
    @Length(1, 100)
    title: string;

    @IsString()
    @IsNotEmpty({ message: "You must enter content" })
    content: string;

    @IsOptional()
    @IsString()
    image?: string;
}

export class UpdatePostDto {
    @IsOptional()
    @IsString()
    @Length(1, 100)
    title?: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsString()
    image?: string;
}
