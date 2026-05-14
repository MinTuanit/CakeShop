import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from '@/modules/carts/schema/cart.schema';
import { requiresStock } from '@/modules/products/product-kind';
import {
  Product,
  ProductDocument,
} from '@/modules/products/schema/product.schema';
import { User, UserDocument } from '@/modules/users/schema/user.schema';
import { CreateOrderFromCartDto } from './dto/create-order-from-cart.dto';
import { CreateOrderDto, CreateOrderItemDto } from './dto/create-order.dto';
import {
  OrderItemResponseDto,
  OrderResponseDto,
} from './dto/order-response.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import {
  Order,
  OrderDocument,
  OrderItem,
  OrderStatus,
} from './schema/order.schema';

interface CheckoutInfo {
  customerName: string;
  phone: string;
  deliveryAddress: string;
  note?: string;
}

interface OrderItemPayload {
  product: Types.ObjectId;
  name: string;
  price: number;
  category: string;
  imageUrl?: string;
  quantity: number;
  subtotal: number;
}

interface StockChange {
  product: Types.ObjectId;
  quantity: number;
  category: string;
  name?: string;
}

interface OrderItemLean {
  product: Types.ObjectId | string | { _id: Types.ObjectId | string };
  name: string;
  price: number;
  category: string;
  imageUrl?: string;
  quantity: number;
  subtotal: number;
}

interface OrderLean {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  items: OrderItemLean[];
  totalItems: number;
  totalPrice: number;
  status: OrderStatus;
  customerName: string;
  phone: string;
  deliveryAddress: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
  ) {}

  async create(
    userId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    const userObjectId = await this.ensureUserExists(userId);
    const items = await this.buildOrderItems(createOrderDto.items);
    const checkoutInfo = this.normalizeCheckoutInfo(createOrderDto);

    await this.reserveStock(items);

    let order: OrderDocument;
    try {
      order = await this.orderModel.create({
        user: userObjectId,
        items,
        ...this.calculateTotals(items),
        ...checkoutInfo,
        status: 'pending',
      });
    } catch (error) {
      await this.releaseStock(items, false);
      throw error;
    }

    return this.toOrderResponse(order);
  }

  async createFromCart(
    userId: string,
    createOrderFromCartDto: CreateOrderFromCartDto,
  ): Promise<OrderResponseDto> {
    const userObjectId = await this.ensureUserExists(userId);
    const cart = await this.cartModel.findOne({ user: userObjectId });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Gio hang dang trong');
    }

    const cartItems = cart.items.map((item) => ({
      productId: this.getObjectIdString(item.product),
      quantity: item.quantity,
    }));
    const items = await this.buildOrderItems(cartItems);
    const checkoutInfo = this.normalizeCheckoutInfo(createOrderFromCartDto);

    await this.reserveStock(items);

    let order: OrderDocument;
    try {
      order = await this.orderModel.create({
        user: userObjectId,
        items,
        ...this.calculateTotals(items),
        ...checkoutInfo,
        status: 'pending',
      });
    } catch (error) {
      await this.releaseStock(items, false);
      throw error;
    }

    cart.items = [];
    await cart.save();

    return this.toOrderResponse(order);
  }

  async getMyOrders(userId: string): Promise<OrderResponseDto[]> {
    const userObjectId = await this.ensureUserExists(userId);
    const orders = await this.orderModel
      .find({ user: userObjectId })
      .sort({ createdAt: -1 });

    return orders.map((order) => this.toOrderResponse(order));
  }

  async getMyOrder(userId: string, orderId: string): Promise<OrderResponseDto> {
    const order = await this.getOrderForUser(userId, orderId);
    return this.toOrderResponse(order);
  }

  async updateItem(
    userId: string,
    orderId: string,
    productId: string,
    updateOrderItemDto: UpdateOrderItemDto,
  ): Promise<OrderResponseDto> {
    const order = await this.getOrderForUser(userId, orderId);
    this.ensureOrderCanBeEdited(order);
    this.toObjectId(productId, 'ID san pham khong hop le');

    const item = this.findOrderItem(order, productId);
    const quantity = this.normalizeQuantity(updateOrderItemDto.quantity);
    const currentQuantity = item.quantity;

    if (quantity > currentQuantity) {
      await this.getAvailableProduct(productId);
      await this.reserveStock([
        {
          product: this.toObjectId(productId, 'ID san pham khong hop le'),
          name: item.name,
          category: item.category,
          quantity: quantity - currentQuantity,
        },
      ]);
    }

    if (quantity < currentQuantity) {
      await this.releaseStock([
        {
          product: this.toObjectId(productId, 'ID san pham khong hop le'),
          name: item.name,
          category: item.category,
          quantity: currentQuantity - quantity,
        },
      ]);
    }

    item.quantity = quantity;
    item.subtotal = item.price * quantity;
    this.applyTotals(order);

    await order.save();
    return this.toOrderResponse(order);
  }

  async removeItem(
    userId: string,
    orderId: string,
    productId: string,
  ): Promise<OrderResponseDto> {
    const order = await this.getOrderForUser(userId, orderId);
    this.ensureOrderCanBeEdited(order);
    this.toObjectId(productId, 'ID san pham khong hop le');

    if (order.items.length <= 1) {
      throw new BadRequestException(
        'Don hang phai co it nhat mot san pham. Hay huy don hang neu khong muon dat tiep.',
      );
    }

    const item = this.findOrderItem(order, productId);
    await this.releaseStock([
      {
        product: this.toObjectId(productId, 'ID san pham khong hop le'),
        name: item.name,
        category: item.category,
        quantity: item.quantity,
      },
    ]);

    order.items = order.items.filter(
      (orderItem) => this.getObjectIdString(orderItem.product) !== productId,
    );
    this.applyTotals(order);

    await order.save();
    return this.toOrderResponse(order);
  }

  async cancelOrder(
    userId: string,
    orderId: string,
  ): Promise<OrderResponseDto> {
    const order = await this.getOrderForUser(userId, orderId);

    if (order.status === 'cancelled') {
      throw new BadRequestException('Don hang da duoc huy');
    }

    if (order.status === 'completed') {
      throw new BadRequestException('Khong the huy don hang da hoan thanh');
    }

    await this.releaseStock(
      order.items.map((item) => ({
        product: this.toObjectId(
          this.getObjectIdString(item.product),
          'ID san pham khong hop le',
        ),
        name: item.name,
        category: item.category,
        quantity: item.quantity,
      })),
    );

    order.status = 'cancelled';
    await order.save();

    return this.toOrderResponse(order);
  }

  private async buildOrderItems(
    requestedItems: CreateOrderItemDto[],
  ): Promise<OrderItemPayload[]> {
    const itemMap = this.mergeRequestedItems(requestedItems);
    const items: OrderItemPayload[] = [];

    for (const [productId, quantity] of itemMap.entries()) {
      const product = await this.getAvailableProduct(productId);
      this.ensureStockAvailable(product, quantity);

      items.push({
        product: this.toObjectId(productId, 'ID san pham khong hop le'),
        name: product.name,
        price: product.price,
        category: product.category,
        imageUrl: product.imageUrl,
        quantity,
        subtotal: product.price * quantity,
      });
    }

    return items;
  }

  private mergeRequestedItems(
    requestedItems: CreateOrderItemDto[],
  ): Map<string, number> {
    if (!Array.isArray(requestedItems) || requestedItems.length === 0) {
      throw new BadRequestException('Don hang phai co it nhat mot san pham');
    }

    const itemMap = new Map<string, number>();

    for (const requestedItem of requestedItems) {
      const productObjectId = this.toObjectId(
        requestedItem?.productId,
        'ID san pham khong hop le',
      );
      const quantity = this.normalizeQuantity(requestedItem?.quantity);
      const productId = productObjectId.toString();

      itemMap.set(productId, (itemMap.get(productId) ?? 0) + quantity);
    }

    return itemMap;
  }

  private normalizeCheckoutInfo(
    dto: CreateOrderDto | CreateOrderFromCartDto,
  ): CheckoutInfo {
    const note = this.normalizeOptionalString(dto.note);

    return {
      customerName: this.normalizeRequiredString(
        dto.customerName,
        'Ten nguoi nhan khong hop le',
      ),
      phone: this.normalizeRequiredString(
        dto.phone,
        'So dien thoai nhan hang khong hop le',
      ),
      deliveryAddress: this.normalizeRequiredString(
        dto.deliveryAddress,
        'Dia chi giao hang khong hop le',
      ),
      ...(note ? { note } : {}),
    };
  }

  private normalizeRequiredString(value: unknown, message: string): string {
    if (typeof value !== 'string' || !value.trim()) {
      throw new BadRequestException(message);
    }

    return value.trim();
  }

  private normalizeOptionalString(value: unknown): string | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (typeof value !== 'string') {
      throw new BadRequestException('Ghi chu khong hop le');
    }

    const normalizedValue = value.trim();
    return normalizedValue || undefined;
  }

  private normalizeQuantity(value: unknown): number {
    const quantity = Number(value);

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new BadRequestException('So luong san pham khong hop le');
    }

    return quantity;
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

  private ensureStockAvailable(product: ProductDocument, quantity: number) {
    if (!requiresStock(product.category)) {
      return;
    }

    if (product.stock === undefined || product.stock < quantity) {
      throw new BadRequestException('So luong vuot qua ton kho san pham');
    }
  }

  private async getOrderForUser(
    userId: string,
    orderId: string,
  ): Promise<OrderDocument> {
    const userObjectId = await this.ensureUserExists(userId);
    const orderObjectId = this.toObjectId(orderId, 'ID don hang khong hop le');
    const order = await this.orderModel.findOne({
      _id: orderObjectId,
      user: userObjectId,
    });

    if (!order) {
      throw new NotFoundException('Khong tim thay don hang');
    }

    return order;
  }

  private ensureOrderCanBeEdited(order: OrderDocument) {
    if (order.status !== 'pending') {
      throw new BadRequestException(
        'Chi co the dieu chinh don hang dang cho xu ly',
      );
    }
  }

  private findOrderItem(order: OrderDocument, productId: string): OrderItem {
    const item = order.items.find(
      (orderItem) => this.getObjectIdString(orderItem.product) === productId,
    );

    if (!item) {
      throw new NotFoundException('San pham khong co trong don hang');
    }

    return item;
  }

  private async reserveStock(items: StockChange[]) {
    const reservedItems: StockChange[] = [];

    try {
      for (const item of items) {
        if (!requiresStock(item.category)) {
          continue;
        }

        const product = await this.productModel.findOneAndUpdate(
          {
            _id: item.product,
            isAvailable: true,
            stock: { $gte: item.quantity },
          },
          { $inc: { stock: -item.quantity } },
          { new: true },
        );

        if (!product) {
          throw new BadRequestException(
            `So luong vuot qua ton kho san pham${item.name ? `: ${item.name}` : ''}`,
          );
        }

        reservedItems.push(item);
      }
    } catch (error) {
      await this.releaseStock(reservedItems, false);
      throw error;
    }
  }

  private async releaseStock(items: StockChange[], throwWhenMissing = true) {
    for (const item of items) {
      if (!requiresStock(item.category)) {
        continue;
      }

      const product = await this.productModel.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });

      if (!product && throwWhenMissing) {
        throw new NotFoundException('Khong tim thay san pham de hoan ton kho');
      }
    }
  }

  private calculateTotals(items: OrderItemPayload[]) {
    return {
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: items.reduce((sum, item) => sum + item.subtotal, 0),
    };
  }

  private applyTotals(order: OrderDocument) {
    const totals = this.calculateTotals(order.items);
    order.totalItems = totals.totalItems;
    order.totalPrice = totals.totalPrice;
  }

  private toOrderResponse(order: OrderDocument): OrderResponseDto {
    const orderObject = order.toObject() as OrderLean;

    return {
      _id: this.getObjectIdString(orderObject._id),
      user: this.getObjectIdString(orderObject.user),
      items: orderObject.items.map((item) => this.toOrderItemResponse(item)),
      totalItems: orderObject.totalItems,
      totalPrice: orderObject.totalPrice,
      status: orderObject.status,
      customerName: orderObject.customerName,
      phone: orderObject.phone,
      deliveryAddress: orderObject.deliveryAddress,
      note: orderObject.note,
      createdAt: orderObject.createdAt,
      updatedAt: orderObject.updatedAt,
    };
  }

  private toOrderItemResponse(item: OrderItemLean): OrderItemResponseDto {
    return {
      product: this.getObjectIdString(item.product),
      name: item.name,
      price: item.price,
      category: item.category,
      imageUrl: item.imageUrl,
      quantity: item.quantity,
      subtotal: item.subtotal,
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
