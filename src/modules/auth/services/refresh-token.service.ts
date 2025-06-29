import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomBytes } from 'crypto';
import {
  RefreshToken,
  RefreshTokenDocument,
} from '../schemas/refresh-token.schema';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
  ) {}

  async generateRefreshToken(
    userId: string,
    deviceInfo?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<string> {
    // Generate a random refresh token
    const token = randomBytes(40).toString('hex');

    // Set expiration time (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Save to database
    const refreshToken = new this.refreshTokenModel({
      token,
      userId,
      expiresAt,
      deviceInfo,
      ipAddress,
      userAgent,
    });

    await refreshToken.save();
    return token;
  }

  async validateRefreshToken(
    token: string,
  ): Promise<RefreshTokenDocument | null> {
    return this.refreshTokenModel
      .findOne({
        token,
        isRevoked: false,
        expiresAt: { $gt: new Date() },
      })
      .exec();
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.refreshTokenModel
      .updateOne({ token }, { isRevoked: true })
      .exec();
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenModel
      .updateMany({ userId, isRevoked: false }, { isRevoked: true })
      .exec();
  }

  async cleanupExpiredTokens(): Promise<void> {
    await this.refreshTokenModel
      .deleteMany({
        expiresAt: { $lt: new Date() },
      })
      .exec();
  }

  async getUserActiveTokens(userId: string): Promise<RefreshTokenDocument[]> {
    return this.refreshTokenModel
      .find({
        userId,
        isRevoked: false,
        expiresAt: { $gt: new Date() },
      })
      .exec();
  }

  async rotateRefreshToken(oldToken: string, userId: string): Promise<string> {
    // Revoke old token
    await this.revokeRefreshToken(oldToken);

    // Generate new token
    return this.generateRefreshToken(userId);
  }
}
