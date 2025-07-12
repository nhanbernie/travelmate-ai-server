import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import {
  PasswordReset,
  PasswordResetDocument,
} from '../schemas/password-reset.schema';
import { EmailService } from './email.service';

@Injectable()
export class PasswordResetService {
  private readonly MAX_ATTEMPTS = 5;
  private readonly OTP_EXPIRY_MINUTES = 10;

  constructor(
    @InjectModel(PasswordReset.name)
    private passwordResetModel: Model<PasswordResetDocument>,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  async generateOTP(): Promise<string> {
    // Generate 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendPasswordResetOTP(
    userId: string,
    email: string,
    userName?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    // Check if there's a recent OTP request (rate limiting)
    const recentOTP = await this.passwordResetModel.findOne({
      email,
      createdAt: { $gt: new Date(Date.now() - 2 * 60 * 1000) }, // 1 minute ago
    });

    if (recentOTP) {
      throw new BadRequestException(
        'Please wait 2 minutes before requesting another OTP',
      );
    }

    // Invalidate all previous OTPs for this user
    await this.passwordResetModel.updateMany(
      { userId, isUsed: false },
      { isUsed: true },
    );

    // Generate new OTP
    const otp = await this.generateOTP();
    const expiresAt = new Date(
      Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000,
    );

    // Save OTP to database
    const passwordReset = new this.passwordResetModel({
      userId,
      email,
      otp,
      expiresAt,
      ipAddress,
      userAgent,
    });

    await passwordReset.save();

    // Send OTP via email
    await this.emailService.sendPasswordResetOTP(email, otp, userName);
  }

  async verifyOTP(email: string, otp: string): Promise<PasswordResetDocument> {
    const passwordReset = await this.passwordResetModel.findOne({
      email,
      otp,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!passwordReset) {
      // Log failed attempt
      await this.passwordResetModel.updateMany(
        { email, isUsed: false },
        { $inc: { attempts: 1 } },
      );

      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Check max attempts
    if (passwordReset.attempts >= this.MAX_ATTEMPTS) {
      passwordReset.isUsed = true;
      await passwordReset.save();
      throw new UnauthorizedException(
        'Too many failed attempts. Please request a new OTP',
      );
    }

    return passwordReset;
  }

  async markOTPAsUsed(otpId: string): Promise<void> {
    await this.passwordResetModel.findByIdAndUpdate(otpId, { isUsed: true });
  }

  async cleanupExpiredOTPs(): Promise<void> {
    await this.passwordResetModel.deleteMany({
      expiresAt: { $lt: new Date() },
    });
  }

  async getUserActiveOTPs(userId: string): Promise<PasswordResetDocument[]> {
    return this.passwordResetModel.find({
      userId,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });
  }

  async revokeAllUserOTPs(userId: string): Promise<void> {
    await this.passwordResetModel.updateMany(
      { userId, isUsed: false },
      { isUsed: true },
    );
  }
}
