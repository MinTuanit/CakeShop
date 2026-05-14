import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { orderStatuses } from '../schema/order.schema';
import type { OrderStatus } from '../schema/order.schema';

export class OrderItemResponseDto {
  @ApiProperty({ example: '662f4f493b5b36574e9f4a91' })
  product!: string;

  @ApiProperty({ example: 'Banh kem sinh nhat socola' })
  name!: string;

  @ApiProperty({ example: 250000, minimum: 0 })
  price!: number;

  @ApiProperty({ example: 'birthday' })
  category!: string;

  @ApiPropertyOptional({ example: 'https://example.com/cake.jpg' })
  imageUrl?: string;

  @ApiProperty({ example: 2, minimum: 1 })
  quantity!: number;

  @ApiProperty({ example: 500000, minimum: 0 })
  subtotal!: number;
}

export class OrderResponseDto {
  @ApiProperty({ example: '6630a1a93b5b36574e9f4b12' })
  _id!: string;

  @ApiProperty({ example: '662f4f493b5b36574e9f4a90' })
  user!: string;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items!: OrderItemResponseDto[];

  @ApiProperty({ example: 3, minimum: 0 })
  totalItems!: number;

  @ApiProperty({ example: 750000, minimum: 0 })
  totalPrice!: number;

  @ApiProperty({ enum: orderStatuses, example: 'pending' })
  status!: OrderStatus;

  @ApiProperty({ example: 'Nguyen Van A' })
  customerName!: string;

  @ApiProperty({ example: '0909123456' })
  phone!: string;

  @ApiProperty({ example: '12 Nguyen Trai, Quan 1, TP.HCM' })
  deliveryAddress!: string;

  @ApiPropertyOptional({ example: 'Giao truoc 18h, viet chu Happy Birthday' })
  note?: string;

  @ApiProperty({ example: '2026-05-05T07:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-05-05T07:00:00.000Z' })
  updatedAt!: Date;
}
