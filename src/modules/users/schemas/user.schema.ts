import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  timestamps: true, // Tự động tạo createdAt, updatedAt
  collection: 'users',
})
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    type: [String],
    default: ['user'],
    enum: ['user', 'admin', 'moderator'],
  })
  roles: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop()
  avatar?: string;

  @Prop()
  phoneNumber?: string;

  @Prop({ type: Date })
  lastLoginAt?: Date;

  // Virtual field - không lưu trong DB
  get fullName(): string {
    return this.firstName && this.lastName
      ? `${this.firstName} ${this.lastName}`
      : this.username;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

// Middleware: Hash password trước khi save (nếu cần)
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  // Password đã được hash ở service level, skip ở đây
  next();
});

// Index cho performance
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ createdAt: -1 });
