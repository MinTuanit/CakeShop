import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{10,11}$/)
  phone!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password!: string;
}
