import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '662f4f493b5b36574e9f4a91' })
  _id!: string;

  @ApiProperty({ example: 'Nguyen Van A' })
  name!: string;

  @ApiProperty({ example: '0912345678' })
  phone!: string;

  @ApiProperty({ example: 'user' })
  role!: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  email?: string;

  @ApiPropertyOptional({ example: '123 Nguyen Trai, Quan 1, TP HCM' })
  address?: string;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  avatar?: string;

  @ApiPropertyOptional({ example: '2004-01-01T00:00:00.000Z' })
  dateOfBirth?: Date;

  @ApiPropertyOptional({ example: '2026-05-04T08:00:00.000Z' })
  lastLogin?: Date;
}

export class MeResponseDto {
  @ApiProperty({ type: UserResponseDto, nullable: true })
  user!: UserResponseDto | null;
}
