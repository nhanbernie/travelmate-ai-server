import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import {
  ResponseBuilder,
  ApiResponse,
} from '../../common/interfaces/response.interface';
import { LoginResponseDto, UserResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    return this.usersService.validateUser(email, password);
  }

  async login(user: any): Promise<ApiResponse<LoginResponseDto>> {
    const payload = {
      email: user.email,
      sub: user._id || user.id,
      username: user.username,
      roles: user.roles,
    };

    if (user._id || user.id) {
      await this.usersService.updateLastLogin(user._id || user.id);
    }

    const userResponse: UserResponseDto = {
      id: user._id || user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
    };

    const loginData: LoginResponseDto = {
      access_token: this.jwtService.sign(payload),
      user: userResponse,
    };

    return ResponseBuilder.success(loginData, 'Login successful', 200);
  }
}
