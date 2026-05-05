import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ example: '662f4f493b5b36574e9f4a91' })
  _id!: string;

  @ApiProperty({ example: 'Banh kem sinh nhat socola' })
  name!: string;

  @ApiProperty({ example: 250000, minimum: 0 })
  price!: number;

  @ApiPropertyOptional({ example: 'Banh kem socola 2 tang cho tiec sinh nhat' })
  description?: string;

  @ApiProperty({ example: 'birthday' })
  category!: string;

  @ApiPropertyOptional({ example: 'socola' })
  flavor?: string;

  @ApiPropertyOptional({ example: '20cm' })
  size?: string;

  @ApiPropertyOptional({ example: 'https://example.com/cake.jpg' })
  imageUrl?: string;

  @ApiProperty({ type: [String], example: ['https://example.com/cake-1.jpg'] })
  images!: string[];

  @ApiProperty({
    type: [String],
    example: ['socola', 'kem tuoi', 'bot mi', 'trung ga'],
  })
  mainIngredients!: string[];

  @ApiPropertyOptional({
    example: 20,
    minimum: 0,
    description: 'Chi co voi san pham khong phai banh kem',
  })
  stock?: number;

  @ApiProperty({ example: true })
  isAvailable!: boolean;

  @ApiProperty({ example: '2026-05-04T08:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-05-04T08:00:00.000Z' })
  updatedAt!: Date;
}

export class DeleteProductResponseDto {
  @ApiProperty({ example: 'Xoa san pham thanh cong' })
  message!: string;
}
