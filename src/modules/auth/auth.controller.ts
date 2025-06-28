import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateUserDto, LoginDto } from '../users/dto/user.dto';
import { UsersService } from '../users/users.service';
import {
  ResponseBuilder,
  ApiResponse,
} from '../../common/interfaces/response.interface';
import { RegisterResponseDto } from './dto/auth-response.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ApiResponse<RegisterResponseDto>> {
    const user = await this.usersService.createWithValidation(createUserDto);
    const loginResponse = await this.authService.login(user);

    if (!loginResponse?.data?.access_token || !loginResponse?.data?.user) {
      throw new Error('Failed to generate authentication token');
    }

    return ResponseBuilder.success(
      {
        access_token: loginResponse.data.access_token,
        user: loginResponse.data.user,
      },
      'User registered successfully',
      201,
    );
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
