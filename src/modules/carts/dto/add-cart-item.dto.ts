import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsMongoId, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class AddCartItemDto {
  @ApiProperty({
    example: '662f4f493b5b36574e9f4a91',
    description: 'MongoDB ObjectId cua san pham can them vao gio hang',
  })
  @IsNotEmpty()
  @IsMongoId()
  productId!: string;

  @ApiPropertyOptional({
    example: 2,
    minimum: 1,
    default: 1,
    description: 'So luong san pham can them',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}
