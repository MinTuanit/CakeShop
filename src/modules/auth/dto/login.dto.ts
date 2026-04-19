import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{10,11}$/)
  phone!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;
}
