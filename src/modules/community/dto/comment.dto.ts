import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'ID of the post to comment on',
    example: '507f1f77bcf86cd799439011',
    format: 'ObjectId',
  })
  @IsNotEmpty()
  @IsMongoId()
  postId: string;

  @ApiProperty({
    description: 'Comment content',
    example: 'Looks amazing! How was the weather during your trip?',
    maxLength: 1000,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000, { message: 'Comment must not exceed 1000 characters' })
  content: string;
}

export class UpdateCommentDto {
  @ApiPropertyOptional({
    description: 'Updated comment content',
    example: 'Updated: Looks absolutely amazing! How was the weather there?',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Comment must not exceed 1000 characters' })
  content?: string;
}

export class CommentResponseDto {
  @ApiProperty({
    description: 'Unique comment identifier',
    example: '507f1f77bcf86cd799439020',
  })
  commentId: string;

  @ApiProperty({
    description: 'ID of the post this comment belongs to',
    example: '507f1f77bcf86cd799439011',
  })
  postId: string;

  @ApiProperty({
    description: 'ID of the comment author',
    example: '507f1f77bcf86cd799439021',
  })
  userId: string;

  @ApiProperty({
    description: 'Comment content',
    example: 'Looks amazing! How was the weather during your trip?',
  })
  content: string;

  @ApiProperty({
    description: 'Comment creation timestamp',
    example: '2024-01-16T09:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Comment last update timestamp',
    example: '2024-01-16T09:30:00.000Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Comment author information',
    example: {
      userId: '507f1f77bcf86cd799439021',
      fullName: 'Jane Smith',
      email: 'jane.smith@example.com',
    },
  })
  user?: {
    userId: string;
    fullName: string;
    email: string;
  };
}
