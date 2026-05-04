import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateProductDto } from './dto/create-product.dto';
import { DeleteProductResponseDto, ProductResponseDto } from './dto/product-response.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @ApiOperation({ summary: 'Tao san pham banh kem' })
  @ApiBody({ type: CreateProductDto })
  @ApiCreatedResponse({
    description: 'San pham da duoc tao',
    type: ProductResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Du lieu san pham khong hop le' })
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @ApiOperation({ summary: 'Lay danh sach san pham' })
  @ApiQuery({
    name: 'category',
    required: false,
    example: 'birthday',
    description: 'Loc theo loai banh kem',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    example: 'socola',
    description: 'Tim theo ten san pham',
  })
  @ApiOkResponse({
    description: 'Danh sach san pham',
    type: ProductResponseDto,
    isArray: true,
  })
  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.productService.findAll(category, search);
  }

  @ApiOperation({ summary: 'Lay chi tiet san pham' })
  @ApiParam({
    name: 'id',
    example: '662f4f493b5b36574e9f4a91',
    description: 'MongoDB ObjectId cua san pham',
  })
  @ApiOkResponse({
    description: 'Chi tiet san pham',
    type: ProductResponseDto,
  })
  @ApiBadRequestResponse({ description: 'ID san pham khong hop le' })
  @ApiNotFoundResponse({ description: 'Khong tim thay san pham' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @ApiOperation({ summary: 'Cap nhat san pham' })
  @ApiParam({
    name: 'id',
    example: '662f4f493b5b36574e9f4a91',
    description: 'MongoDB ObjectId cua san pham',
  })
  @ApiBody({ type: UpdateProductDto })
  @ApiOkResponse({
    description: 'San pham sau khi cap nhat',
    type: ProductResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Du lieu hoac ID san pham khong hop le' })
  @ApiNotFoundResponse({ description: 'Khong tim thay san pham' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.update(id, updateProductDto);
  }

  @ApiOperation({ summary: 'Xoa san pham' })
  @ApiParam({
    name: 'id',
    example: '662f4f493b5b36574e9f4a91',
    description: 'MongoDB ObjectId cua san pham',
  })
  @ApiOkResponse({
    description: 'Ket qua xoa san pham',
    type: DeleteProductResponseDto,
  })
  @ApiBadRequestResponse({ description: 'ID san pham khong hop le' })
  @ApiNotFoundResponse({ description: 'Khong tim thay san pham' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
