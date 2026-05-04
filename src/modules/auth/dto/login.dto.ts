import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: '0912345678',
    pattern: '^\\d{10,11}$',
    description: 'So dien thoai da dang ky',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{10,11}$/)
  phone!: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty()
  @IsString()
  password!: string;
}
