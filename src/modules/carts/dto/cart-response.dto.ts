import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CartProductResponseDto {
  @ApiProperty({ example: '662f4f493b5b36574e9f4a91' })
  _id!: string;

  @ApiProperty({ example: 'Banh kem sinh nhat socola' })
  name!: string;

  @ApiProperty({ example: 250000, minimum: 0 })
  price!: number;

  @ApiProperty({
    example: 'cake',
    description: 'Loai san pham: cake, candle, hat...',
  })
  category!: string;

  @ApiPropertyOptional({ example: 'https://example.com/cake.jpg' })
  imageUrl?: string;

  @ApiPropertyOptional({
    example: 20,
    minimum: 0,
    description: 'Chi co voi san pham khong phai banh kem',
  })
  stock?: number;

  @ApiProperty({ example: true })
  isAvailable!: boolean;
}

export class CartItemResponseDto {
  @ApiProperty({ type: CartProductResponseDto, nullable: true })
  product!: CartProductResponseDto | null;

  @ApiProperty({ example: 2, minimum: 1 })
  quantity!: number;

  @ApiProperty({ example: 500000, minimum: 0 })
  subtotal!: number;
}

export class CartResponseDto {
  @ApiProperty({ example: '6630a1a93b5b36574e9f4b12' })
  _id!: string;

  @ApiProperty({ example: '662f4f493b5b36574e9f4a90' })
  user!: string;

  @ApiProperty({ type: [CartItemResponseDto] })
  items!: CartItemResponseDto[];

  @ApiProperty({ example: 3, minimum: 0 })
  totalItems!: number;

  @ApiProperty({ example: 750000, minimum: 0 })
  totalPrice!: number;

  @ApiProperty({ example: '2026-05-05T07:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-05-05T07:00:00.000Z' })
  updatedAt!: Date;
}

export class CartMessageResponseDto {
  @ApiProperty({ example: 'Da xoa san pham khoi gio hang' })
  message!: string;

  @ApiProperty({ type: CartResponseDto })
  cart!: CartResponseDto;
}
