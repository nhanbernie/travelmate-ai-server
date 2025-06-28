import { IsNotEmpty, IsString } from 'class-validator';

export interface UserResponseDto {
  id: string;
  username: string;
  email: string;
  roles: string[];
  firstName?: string;
  lastName?: string;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LoginResponseDto {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: UserResponseDto;
}

export interface RegisterResponseDto {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: UserResponseDto;
}

export interface RefreshTokenResponseDto {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export class RefreshTokenRequestDto {
  @IsNotEmpty({ message: 'Refresh token is required' })
  @IsString({ message: 'Refresh token must be a string' })
  refresh_token: string;
}
