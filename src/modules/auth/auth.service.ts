import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  LoginResponseDto,
  UserResponseDto,
  RefreshTokenResponseDto,
} from './dto/auth-response.dto';
import { RefreshTokenService } from './services/refresh-token.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private refreshTokenService: RefreshTokenService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    return this.usersService.validateUser(email, password);
  }

  async login(
    user: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<LoginResponseDto> {
    const payload = {
      email: user.email,
      sub: user._id || user.id,
      username: user.username,
      roles: user.roles,
    };

    // Update last login time
    if (user._id || user.id) {
      await this.usersService.updateLastLogin(user._id || user.id);
    }

    // Generate access token
    const accessTokenExpiresIn = this.configService.get<string>(
      'JWT_ACCESS_EXPIRES_IN',
      '15m',
    );
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: accessTokenExpiresIn,
    });

    // Generate refresh token
    const refreshToken = await this.refreshTokenService.generateRefreshToken(
      user._id || user.id,
      'web', // deviceInfo
      ipAddress,
      userAgent,
    );

    const userResponse: UserResponseDto = {
      id: user._id || user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: this.parseExpiresIn(accessTokenExpiresIn),
      user: userResponse,
    };
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<RefreshTokenResponseDto> {
    // Validate refresh token
    const storedToken =
      await this.refreshTokenService.validateRefreshToken(refreshToken);

    if (!storedToken) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Get user
    const user = await this.usersService.findOne(storedToken.userId.toString());
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate new access token
    const payload = {
      email: user.email,
      sub: (user as any)._id || (user as any).id,
      username: user.username,
      roles: user.roles,
    };

    const accessTokenExpiresIn = this.configService.get<string>(
      'JWT_ACCESS_EXPIRES_IN',
      '15m',
    );
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: accessTokenExpiresIn,
    });

    // Optionally rotate refresh token (recommended for security)
    const newRefreshToken = await this.refreshTokenService.rotateRefreshToken(
      refreshToken,
      (user as any)._id || (user as any).id,
    );

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
      expires_in: this.parseExpiresIn(accessTokenExpiresIn),
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenService.revokeRefreshToken(refreshToken);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.refreshTokenService.revokeAllUserTokens(userId);
  }

  private parseExpiresIn(expiresIn: string): number {
    // Convert '15m', '1h', '7d' etc to seconds
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 900; // Default 15 minutes
    }
  }
}
