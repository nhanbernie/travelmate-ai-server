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
  user: UserResponseDto;
}

export interface RegisterResponseDto {
  access_token: string;
  user: UserResponseDto;
}
  