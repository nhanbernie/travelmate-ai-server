import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PasswordResetDocument = PasswordReset & Document;

@Schema({
  timestamps: true,
})
export class PasswordReset {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  otp: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: false })
  isUsed: boolean;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;

  @Prop({ default: 0 })
  attempts: number;
}

export const PasswordResetSchema = SchemaFactory.createForClass(PasswordReset);

// TTL Index - auto delete expired OTP
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

PasswordResetSchema.index({ email: 1, otp: 1 });
PasswordResetSchema.index({ userId: 1 });
