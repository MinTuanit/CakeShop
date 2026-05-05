import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, min: 0 })
  price!: number;

  @Prop({ default: '', trim: true })
  description!: string;

  @Prop({ required: true, trim: true })
  category!: string;

  @Prop({ trim: true })
  flavor?: string;

  @Prop({ trim: true })
  size?: string;

  @Prop({ trim: true })
  imageUrl?: string;

  @Prop({ type: [String], default: [] })
  images!: string[];

  @Prop({ type: [String], default: [] })
  mainIngredients!: string[];

  @Prop({ min: 0 })
  stock?: number;

  @Prop({ default: true })
  isAvailable!: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
