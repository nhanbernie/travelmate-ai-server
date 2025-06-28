import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    // UsersService.validateUser đã handle bcrypt comparison
    return this.usersService.validateUser(email, password);
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user._id || user.id, // MongoDB sử dụng _id
      username: user.username,
      roles: user.roles,
    };

    // Update last login time
    if (user._id || user.id) {
      await this.usersService.updateLastLogin(user._id || user.id);
    }

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id || user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
      },
    };
  }
}
