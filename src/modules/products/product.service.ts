import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { requiresStock } from './product-kind';
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
    const productPayload = this.normalizeCreateProduct(createProductDto);
    const product = await this.productModel.create(productPayload);
    return this.toProductResponse(product);
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

    const products = await this.productModel.find(filter).sort({ createdAt: -1 });
    return products.map((product) => this.toProductResponse(product));
  }

  async findOne(id: string) {
    this.validateObjectId(id);
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException('Khong tim thay san pham');
    }
    return this.toProductResponse(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    this.validateObjectId(id);
    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException('Khong tim thay san pham');
    }

    const productPayload = this.normalizeUpdateProduct(updateProductDto, product);
    product.set(productPayload);

    if (!requiresStock(productPayload.category ?? product.category)) {
      product.stock = undefined;
    }

    const updatedProduct = await product.save();
    return this.toProductResponse(updatedProduct);
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

  private normalizeCreateProduct(createProductDto: CreateProductDto) {
    const productPayload = { ...createProductDto };

    this.applyStockRule(productPayload.category, productPayload.stock);

    if (!requiresStock(productPayload.category)) {
      delete productPayload.stock;
    }

    return productPayload;
  }

  private normalizeUpdateProduct(
    updateProductDto: UpdateProductDto,
    currentProduct: ProductDocument,
  ) {
    const productPayload = { ...updateProductDto };
    const nextCategory = productPayload.category ?? currentProduct.category;
    const nextStock = productPayload.stock ?? currentProduct.stock;

    this.applyStockRule(nextCategory, nextStock);

    if (!requiresStock(nextCategory)) {
      delete productPayload.stock;
    }

    return productPayload;
  }

  private applyStockRule(category: string, stock: number | undefined) {
    if (requiresStock(category) && stock === undefined) {
      throw new BadRequestException('Vui long nhap ton kho cho san pham phu kien');
    }
  }

  private toProductResponse(product: ProductDocument) {
    const productObject = product.toObject();

    if (!requiresStock(productObject.category)) {
      delete productObject.stock;
    }

    return productObject;
  }
}
