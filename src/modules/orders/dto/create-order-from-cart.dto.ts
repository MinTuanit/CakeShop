import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrderFromCartDto {
  @ApiProperty({ example: 'Nguyen Van A' })
  @IsNotEmpty()
  @IsString()
  customerName!: string;

  @ApiProperty({ example: '0909123456' })
  @IsNotEmpty()
  @IsString()
  phone!: string;

  @ApiProperty({ example: '12 Nguyen Trai, Quan 1, TP.HCM' })
  @IsNotEmpty()
  @IsString()
  deliveryAddress!: string;

  @ApiPropertyOptional({ example: 'Giao truoc 18h, viet chu Happy Birthday' })
  @IsOptional()
  @IsString()
  note?: string;
}
