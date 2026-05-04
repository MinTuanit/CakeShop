import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductDocument } from './schema/product.schema';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) { }

  async create(createProductDto: CreateProductDto) {
    return this.productModel.create(createProductDto);
  }

  async findAll(category?: string, search?: string) {
    const filter: {
      category?: string;
      name?: { $regex: string; $options: string };
    } = {};

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
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
      { new: true, runValidators: true },
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
}
