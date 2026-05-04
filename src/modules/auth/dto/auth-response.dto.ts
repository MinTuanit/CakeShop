import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
  @ApiProperty({ example: '662f4f493b5b36574e9f4a91' })
  _id!: string;

  @ApiProperty({ example: 'Nguyen Van A' })
  name!: string;

  @ApiProperty({ example: '0912345678' })
  phone!: string;
}

export class AuthUserResponseDto extends RegisterResponseDto {
  @ApiProperty({ example: 'user' })
  role!: string;
}

export class LoginResponseDto {
  @ApiProperty({ type: AuthUserResponseDto })
  user!: AuthUserResponseDto;
}
