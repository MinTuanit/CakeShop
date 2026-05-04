import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Banh kem sinh nhat socola' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: 250000, minimum: 0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ example: 'Banh kem socola 2 tang cho tiec sinh nhat' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'birthday', description: 'Loai banh kem' })
  @IsNotEmpty()
  @IsString()
  category!: string;

  @ApiPropertyOptional({ example: 'socola' })
  @IsOptional()
  @IsString()
  flavor?: string;

  @ApiPropertyOptional({ example: '20cm' })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiPropertyOptional({ example: 'https://example.com/cake.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['https://example.com/cake-1.jpg', 'https://example.com/cake-2.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ example: 10, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
