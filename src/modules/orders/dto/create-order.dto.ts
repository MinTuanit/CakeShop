import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @ApiProperty({
    example: '662f4f493b5b36574e9f4a91',
    description: 'MongoDB ObjectId cua san pham can dat',
  })
  @IsNotEmpty()
  @IsMongoId()
  productId!: string;

  @ApiProperty({
    example: 2,
    minimum: 1,
    description: 'So luong san pham can dat',
  })
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

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
