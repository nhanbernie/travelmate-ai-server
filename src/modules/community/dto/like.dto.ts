import { IsNotEmpty, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLikeDto {
  @ApiProperty({
    description: 'ID of the post to like/unlike',
    example: '507f1f77bcf86cd799439011',
    format: 'ObjectId',
  })
  @IsNotEmpty()
  @IsMongoId()
  postId: string;
}

export class LikeResponseDto {
  @ApiProperty({
    description: 'Unique like identifier',
    example: '507f1f77bcf86cd799439030',
  })
  likeId: string;

  @ApiProperty({
    description: 'ID of the user who liked',
    example: '507f1f77bcf86cd799439021',
  })
  userId: string;

  @ApiProperty({
    description: 'ID of the liked post',
    example: '507f1f77bcf86cd799439011',
  })
  postId: string;

  @ApiProperty({
    description: 'Like creation timestamp',
    example: '2024-01-16T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'User who liked the post',
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
