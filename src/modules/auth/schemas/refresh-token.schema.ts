import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RefreshTokenDocument = RefreshToken & Document;

@Schema({
  timestamps: true,
})
export class RefreshToken {
  @Prop({ required: true })
  token: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: false })
  isRevoked: boolean;

  @Prop()
  deviceInfo?: string;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

// Index để tự động xóa expired tokens
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index để query nhanh
RefreshTokenSchema.index({ token: 1 });
RefreshTokenSchema.index({ userId: 1 });
