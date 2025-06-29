import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  Ip,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateUserDto } from '../users/dto/user.dto';
import { UsersService } from '../users/users.service';
import {
  LoginResponseDto,
  RegisterResponseDto,
  RefreshTokenRequestDto,
  RefreshTokenResponseDto,
  ForgotPasswordRequestDto,
  VerifyOTPRequestDto,
  ResetPasswordRequestDto,
} from './dto/auth-response.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ): Promise<RegisterResponseDto> {
    const user = await this.usersService.createWithValidation(createUserDto);
    const loginResponse = await this.authService.login(
      user,
      ipAddress,
      userAgent,
    );

    return {
      access_token: loginResponse.access_token,
      refresh_token: loginResponse.refresh_token,
      expires_in: loginResponse.expires_in,
      user: loginResponse.user,
    };
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Request() req,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ): Promise<LoginResponseDto> {
    return this.authService.login(req.user, ipAddress, userAgent);
  }

  @Post('refresh')
  async refresh(
    @Body() refreshTokenDto: RefreshTokenRequestDto,
  ): Promise<RefreshTokenResponseDto> {
    if (!refreshTokenDto || !refreshTokenDto.refresh_token) {
      throw new BadRequestException('Refresh token is required');
    }

    return this.authService.refreshAccessToken(refreshTokenDto.refresh_token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Body() refreshTokenDto: RefreshTokenRequestDto,
  ): Promise<{ message: string }> {
    if (!refreshTokenDto || !refreshTokenDto.refresh_token) {
      throw new BadRequestException('Refresh token is required');
    }

    await this.authService.logout(refreshTokenDto.refresh_token);
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  async logoutAll(@Request() req): Promise<{ message: string }> {
    const userId = req.user.sub;
    await this.authService.logoutAll(userId);
    return { message: 'Logged out from all devices successfully' };
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordRequestDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ): Promise<{ message: string }> {
    return this.authService.sendPasswordResetOTP(
      forgotPasswordDto.email,
      ipAddress,
      userAgent,
    );
  }

  @Post('verify-otp')
  async verifyOTP(
    @Body() verifyOTPDto: VerifyOTPRequestDto,
  ): Promise<{ message: string; token: string }> {
    return this.authService.verifyPasswordResetOTP(
      verifyOTPDto.email,
      verifyOTPDto.otp,
    );
  }

  @Post('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordRequestDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ): Promise<{ message: string }> {
    return this.authService.resetPassword(
      resetPasswordDto.email,
      resetPasswordDto.otp,
      resetPasswordDto.newPassword,
      ipAddress,
      userAgent,
    );
  }
}
