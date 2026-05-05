import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Product,
  ProductDocument,
} from '@/modules/products/schema/product.schema';
import { requiresStock } from '@/modules/products/product-kind';
import { User, UserDocument } from '@/modules/users/schema/user.schema';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import {
  CartItemResponseDto,
  CartProductResponseDto,
  CartResponseDto,
} from './dto/cart-response.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { Cart, CartDocument, CartItem } from './schema/cart.schema';

interface CartProductLean {
  _id: Types.ObjectId;
  name: string;
  price: number;
  category: string;
  imageUrl?: string;
  stock?: number;
  isAvailable: boolean;
}

interface CartItemLean {
  product: CartProductLean | null;
  quantity: number;
}

interface CartLean {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  items: CartItemLean[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getMyCart(userId: string): Promise<CartResponseDto> {
    const cart = await this.getOrCreateCart(userId);
    return this.toCartResponse(cart);
  }

  async addItem(
    userId: string,
    addCartItemDto: AddCartItemDto,
  ): Promise<CartResponseDto> {
    const quantity = this.normalizeQuantity(addCartItemDto.quantity, 1);
    const product = await this.getAvailableProduct(addCartItemDto.productId);
    const cart = await this.getOrCreateCart(userId);
    const productId = this.getObjectIdString(product._id);
    const currentItem = cart.items.find(
      (item) => this.getObjectIdString(item.product) === productId,
    );
    const nextQuantity = (currentItem?.quantity ?? 0) + quantity;

    this.ensureStockAvailable(product, nextQuantity);

    if (currentItem) {
      currentItem.quantity = nextQuantity;
    } else {
      cart.items.push({
        product: this.toObjectId(productId, 'ID san pham khong hop le'),
        quantity,
      } as CartItem);
    }

    await cart.save();
    return this.toCartResponse(cart);
  }

  async updateItem(
    userId: string,
    productId: string,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    const product = await this.getAvailableProduct(productId);
    const cart = await this.getExistingCart(userId);
    const item = this.findCartItem(cart, productId);
    const quantity = this.normalizeQuantity(updateCartItemDto.quantity);

    this.ensureStockAvailable(product, quantity);
    item.quantity = quantity;

    await cart.save();
    return this.toCartResponse(cart);
  }

  async removeItem(
    userId: string,
    productId: string,
  ): Promise<CartResponseDto> {
    this.toObjectId(productId, 'ID san pham khong hop le');
    const cart = await this.getExistingCart(userId);
    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      (item) => this.getObjectIdString(item.product) !== productId,
    );

    if (cart.items.length === initialLength) {
      throw new NotFoundException('San pham khong co trong gio hang');
    }

    await cart.save();
    return this.toCartResponse(cart);
  }

  async clearCart(userId: string): Promise<CartResponseDto> {
    const cart = await this.getOrCreateCart(userId);
    cart.items = [];
    await cart.save();
    return this.toCartResponse(cart);
  }

  private async getOrCreateCart(userId: string): Promise<CartDocument> {
    const userObjectId = await this.ensureUserExists(userId);
    const cart = await this.cartModel.findOneAndUpdate(
      { user: userObjectId },
      { $setOnInsert: { user: userObjectId, items: [] } },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );

    if (!cart) {
      throw new NotFoundException('Khong tim thay gio hang');
    }

    return cart;
  }

  private async getExistingCart(userId: string): Promise<CartDocument> {
    const userObjectId = await this.ensureUserExists(userId);
    const cart = await this.cartModel.findOne({ user: userObjectId });

    if (!cart) {
      throw new NotFoundException('Khong tim thay gio hang');
    }

    return cart;
  }

  private async ensureUserExists(userId: string): Promise<Types.ObjectId> {
    const userObjectId = this.toObjectId(userId, 'ID nguoi dung khong hop le');
    const userExists = await this.userModel.exists({ _id: userObjectId });

    if (!userExists) {
      throw new NotFoundException('Khong tim thay nguoi dung');
    }

    return userObjectId;
  }

  private async getAvailableProduct(
    productId: string,
  ): Promise<ProductDocument> {
    const productObjectId = this.toObjectId(
      productId,
      'ID san pham khong hop le',
    );
    const product = await this.productModel.findById(productObjectId);

    if (!product) {
      throw new NotFoundException('Khong tim thay san pham');
    }

    if (!product.isAvailable) {
      throw new BadRequestException('San pham hien khong kha dung');
    }

    return product;
  }

  private findCartItem(cart: CartDocument, productId: string): CartItem {
    this.toObjectId(productId, 'ID san pham khong hop le');
    const item = cart.items.find(
      (cartItem) => this.getObjectIdString(cartItem.product) === productId,
    );

    if (!item) {
      throw new NotFoundException('San pham khong co trong gio hang');
    }

    return item;
  }

  private normalizeQuantity(value: unknown, defaultValue?: number): number {
    const quantity = value ?? defaultValue;

    if (!Number.isInteger(quantity) || Number(quantity) < 1) {
      throw new BadRequestException('So luong san pham khong hop le');
    }

    return Number(quantity);
  }

  private ensureStockAvailable(product: ProductDocument, quantity: number) {
    if (!requiresStock(product.category)) {
      return;
    }

    if (product.stock === undefined || product.stock < quantity) {
      throw new BadRequestException('So luong vuot qua ton kho san pham');
    }
  }

  private async toCartResponse(cart: CartDocument): Promise<CartResponseDto> {
    const cartId = this.getObjectIdString(cart._id);
    const populatedCart = await this.cartModel
      .findById(cartId)
      .populate({
        path: 'items.product',
        select: 'name price category imageUrl stock isAvailable',
      })
      .lean<CartLean>();

    if (!populatedCart) {
      throw new NotFoundException('Khong tim thay gio hang');
    }

    const items = populatedCart.items.map((item) =>
      this.toCartItemResponse(item),
    );
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.subtotal, 0);

    return {
      _id: populatedCart._id.toString(),
      user: populatedCart.user.toString(),
      items,
      totalItems,
      totalPrice,
      createdAt: populatedCart.createdAt,
      updatedAt: populatedCart.updatedAt,
    };
  }

  private toCartItemResponse(item: CartItemLean): CartItemResponseDto {
    const product = item.product ? this.toProductResponse(item.product) : null;

    return {
      product,
      quantity: item.quantity,
      subtotal: product ? product.price * item.quantity : 0,
    };
  }

  private toProductResponse(product: CartProductLean): CartProductResponseDto {
    return {
      _id: product._id.toString(),
      name: product.name,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl,
      ...(requiresStock(product.category) ? { stock: product.stock } : {}),
      isAvailable: product.isAvailable,
    };
  }

  private toObjectId(value: string, message: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(message);
    }

    return new Types.ObjectId(value);
  }

  private getObjectIdString(value: unknown): string {
    if (value instanceof Types.ObjectId) {
      return value.toString();
    }

    if (typeof value === 'object' && value !== null && '_id' in value) {
      return String((value as { _id: unknown })._id);
    }

    return String(value);
  }
}
