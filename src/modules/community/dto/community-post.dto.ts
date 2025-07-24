import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsMongoId,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Visibility } from '../schemas/community-post.schema';
import { CommentResponseDto } from './comment.dto';

export class CreateCommunityPostDto {
  @ApiProperty({
    description: 'ID of the itinerary to share',
    example: '507f1f77bcf86cd799439012',
    format: 'ObjectId',
  })
  @IsNotEmpty()
  @IsMongoId()
  itineraryId: string;

  @ApiPropertyOptional({
    description: 'Optional caption for the post',
    example:
      'Amazing 5-day trip to Paris! The Eiffel Tower at sunset was breathtaking 🇫🇷✨',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Caption must not exceed 500 characters' })
  caption?: string;

  @ApiPropertyOptional({
    description: 'Post visibility level',
    enum: Visibility,
    default: Visibility.PUBLIC,
    example: Visibility.PUBLIC,
  })
  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility = Visibility.PUBLIC;
}

export class UpdateCommunityPostDto {
  @ApiPropertyOptional({
    description: 'Updated caption for the post',
    example:
      'Updated: Amazing trip to Paris! Highly recommend visiting in spring! 🇫🇷✨',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Caption must not exceed 500 characters' })
  caption?: string;

  @ApiPropertyOptional({
    description: 'Updated visibility level',
    enum: Visibility,
    example: Visibility.FRIENDS_ONLY,
  })
  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;
}

export class CommunityPostResponseDto {
  @ApiProperty({
    description: 'Unique post identifier',
    example: '507f1f77bcf86cd799439011',
  })
  postId: string;

  @ApiProperty({
    description: 'ID of the shared itinerary',
    example: '507f1f77bcf86cd799439012',
  })
  itineraryId: string;

  @ApiProperty({
    description: 'ID of the post author',
    example: '507f1f77bcf86cd799439013',
  })
  userId: string;

  @ApiPropertyOptional({
    description: 'Post caption',
    example: 'Amazing 5-day trip to Paris! 🇫🇷✨',
  })
  caption?: string;

  @ApiProperty({
    description: 'Post visibility level',
    enum: Visibility,
    example: Visibility.PUBLIC,
  })
  visibility: Visibility;

  @ApiProperty({
    description: 'Post creation timestamp',
    example: '2024-01-15T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Post last update timestamp',
    example: '2024-01-15T10:00:00.000Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Post author information',
    example: {
      userId: '507f1f77bcf86cd799439013',
      fullName: 'John Doe',
      email: 'john.doe@example.com',
    },
  })
  user?: {
    userId: string;
    fullName: string;
    email: string;
  };

  @ApiPropertyOptional({
    description: 'Shared itinerary information',
    example: {
      itineraryId: '507f1f77bcf86cd799439012',
      destination: 'Paris, France',
      startDate: '2024-01-15',
      endDate: '2024-01-20',
      numberOfTravelers: 2,
      tripType: 'COUPLE',
    },
  })
  itinerary?: {
    itineraryId: string;
    destination: string;
    startDate: string;
    endDate: string;
    numberOfTravelers: number;
    tripType: string;
  };

  @ApiProperty({
    description: 'Total number of likes',
    example: 15,
  })
  likesCount: number;

  @ApiProperty({
    description: 'Total number of comments',
    example: 8,
  })
  commentsCount: number;

  @ApiProperty({
    description: 'Whether current user has liked this post',
    example: false,
  })
  isLikedByCurrentUser: boolean;

  @ApiPropertyOptional({
    description: 'Recent comments preview',
    type: [CommentResponseDto],
  })
  recentComments?: CommentResponseDto[];
}
