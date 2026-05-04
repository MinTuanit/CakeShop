import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Nguyen Van A' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({
    example: '0912345678',
    pattern: '^\\d{10,11}$',
    description: 'So dien thoai dung de dang nhap',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{10,11}$/)
  phone!: string;

  @ApiProperty({ example: '123456', minLength: 6 })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password!: string;
}
