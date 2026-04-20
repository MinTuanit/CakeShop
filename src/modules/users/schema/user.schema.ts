import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true })
  phone!: string; // số điện thoại làm tài khoản đăng nhập

  @Prop({ required: true })
  password!: string; // mật khẩu (hash)

  @Prop({ default: 'user' })
  role!: string; // user | admin

  @Prop()
  email?: string;

  @Prop()
  address?: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop()
  avatar?: string;

  @Prop()
  dateOfBirth?: Date;

  @Prop({ default: null })
  lastLogin?: Date;

  @Prop({ default: null })
  refreshToken?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);