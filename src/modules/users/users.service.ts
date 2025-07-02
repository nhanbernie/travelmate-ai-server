import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async validateUserUniqueness(email: string, username: string): Promise<void> {
    const existingUserByEmail = await this.findByEmail(email);
    if (existingUserByEmail) {
      throw new ConflictException('Email already exists');
    }

    const existingUserByUsername = await this.findByUsername(username);
    if (existingUserByUsername) {
      throw new ConflictException('Username already exists');
    }
  }

  async createWithValidation(createUserDto: CreateUserDto): Promise<User> {
    await this.validateUserUniqueness(
      createUserDto.email,
      createUserDto.username,
    );

    return this.create(createUserDto);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      roles: ['user'],
    });

    return user.save();
  }

  async findAll(page: number = 1, limit: number = 10): Promise<User[]> {
    return this.userModel
      .find({ isActive: true })
      .select('-password')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id).select('-password').exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email, isActive: true }).exec(); // Include password for authentication
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userModel
      .findOne({ username, isActive: true })
      .select('-password')
      .exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async remove(id: string): Promise<void> {
    // Soft delete - set isActive = false
    const result = await this.userModel
      .findByIdAndUpdate(id, { isActive: false })
      .exec();

    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  // Additional methods for authentication
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email, isActive: true }).exec();

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(id, { lastLoginAt: new Date() })
      .exec();
  }

  // Search users
  async searchUsers(query: string): Promise<User[]> {
    return this.userModel
      .find({
        $and: [
          { isActive: true },
          {
            $or: [
              { username: { $regex: query, $options: 'i' } },
              { email: { $regex: query, $options: 'i' } },
              { firstName: { $regex: query, $options: 'i' } },
              { lastName: { $regex: query, $options: 'i' } },
            ],
          },
        ],
      })
      .select('-password')
      .limit(20)
      .exec();
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await this.userModel
      .findByIdAndUpdate(userId, { password: hashedPassword }, { new: true })
      .exec();

    if (!result) {
      throw new NotFoundException('User not found');
    }
  }
}
