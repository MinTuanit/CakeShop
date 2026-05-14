import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Product } from '@/modules/products/schema/product.schema';
import { User } from '@/modules/users/schema/user.schema';

export type OrderDocument = Order & Document;

export const orderStatuses = [
  'pending',
  'confirmed',
  'preparing',
  'shipping',
  'completed',
  'cancelled',
] as const;

export type OrderStatus = (typeof orderStatuses)[number];

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: Product.name, required: true })
  product!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, min: 0 })
  price!: number;

  @Prop({ required: true, trim: true })
  category!: string;

  @Prop({ trim: true })
  imageUrl?: string;

  @Prop({ required: true, min: 1, default: 1 })
  quantity!: number;

  @Prop({ required: true, min: 0 })
  subtotal!: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  user!: Types.ObjectId;

  @Prop({ type: [OrderItemSchema], default: [] })
  items!: OrderItem[];

  @Prop({ required: true, min: 0, default: 0 })
  totalItems!: number;

  @Prop({ required: true, min: 0, default: 0 })
  totalPrice!: number;

  @Prop({ enum: orderStatuses, default: 'pending', index: true })
  status!: OrderStatus;

  @Prop({ required: true, trim: true })
  customerName!: string;

  @Prop({ required: true, trim: true })
  phone!: string;

  @Prop({ required: true, trim: true })
  deliveryAddress!: string;

  @Prop({ trim: true })
  note?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ 'items.product': 1 });
