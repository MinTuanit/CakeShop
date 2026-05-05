import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductDocument } from './schema/product.schema';

type ProductListFilter = {
  category?: string;
  name?: { $regex: string; $options: string };
  price?: { $gte?: number; $lte?: number };
};

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) { }

  async create(createProductDto: CreateProductDto) {
    return this.productModel.create(createProductDto);
  }

  async findAll(
    category?: string,
    search?: string,
    minPrice?: string,
    maxPrice?: string,
  ) {
    const filter: ProductListFilter = {};

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const parsedMinPrice = this.parsePriceBound(minPrice, 'minPrice');
    const parsedMaxPrice = this.parsePriceBound(maxPrice, 'maxPrice');

    if (
      parsedMinPrice !== undefined &&
      parsedMaxPrice !== undefined &&
      parsedMinPrice > parsedMaxPrice
    ) {
      throw new BadRequestException('Khoang gia khong hop le');
    }

    const priceFilter: { $gte?: number; $lte?: number } = {};

    if (parsedMinPrice !== undefined) {
      priceFilter.$gte = parsedMinPrice;
    }

    if (parsedMaxPrice !== undefined) {
      priceFilter.$lte = parsedMaxPrice;
    }

    if (Object.keys(priceFilter).length > 0) {
      filter.price = priceFilter;
    }

    return this.productModel.find(filter).sort({ createdAt: -1 });
  }

  async findOne(id: string) {
    this.validateObjectId(id);
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException('Khong tim thay san pham');
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    this.validateObjectId(id);
    const product = await this.productModel.findByIdAndUpdate(
      id,
      updateProductDto,
      { returnDocument: 'after', runValidators: true },
    );

    if (!product) {
      throw new NotFoundException('Khong tim thay san pham');
    }

    return product;
  }

  async remove(id: string) {
    this.validateObjectId(id);
    const product = await this.productModel.findByIdAndDelete(id);
    if (!product) {
      throw new NotFoundException('Khong tim thay san pham');
    }

    return { message: 'Xoa san pham thanh cong' };
  }

  private validateObjectId(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID san pham khong hop le');
    }
  }

  private parsePriceBound(value: string | undefined, label: string) {
    if (!value) {
      return undefined;
    }

    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue) || parsedValue < 0) {
      throw new BadRequestException(`${label} khong hop le`);
    }

    return parsedValue;
  }
}
