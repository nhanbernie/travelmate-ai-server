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

export interface RefreshTokenRequestDto {
  refresh_token: string;
}
