import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import {
  CreateCommunityPostDto,
  UpdateCommunityPostDto,
  CommunityPostResponseDto,
} from '../dto/community-post.dto';
import {
  CreateCommentDto,
  UpdateCommentDto,
  CommentResponseDto,
} from '../dto/comment.dto';
import { CreateLikeDto, LikeResponseDto } from '../dto/like.dto';

// ==================== POST DECORATORS ====================

export const ApiCreatePost = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Create community post',
      description: 'Share an itinerary as a community post with privacy controls',
    }),
    ApiBody({
      type: CreateCommunityPostDto,
      examples: {
        public: {
          summary: 'Public post',
          value: {
            itineraryId: '507f1f77bcf86cd799439012',
            caption: 'Amazing trip to Paris! 🇫🇷✨',
            visibility: 'PUBLIC',
          },
        },
        private: {
          summary: 'Private post',
          value: {
            itineraryId: '507f1f77bcf86cd799439013',
            caption: 'Family vacation memories',
            visibility: 'PRIVATE',
          },
        },
      },
    }),
    ApiBearerAuth('JWT-auth'),
    ApiCreatedResponse({
      description: 'Post created successfully',
      type: CommunityPostResponseDto,
    }),
    ApiBadRequestResponse({
      description: 'Invalid input data',
      schema: {
        example: {
          statusCode: 400,
          message: 'Invalid itineraryId format',
          error: 'Bad Request',
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication required',
    }),
    ApiConflictResponse({
      description: 'Post already exists for this itinerary',
    }),
  );

export const ApiGetPublicPosts = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get public posts feed',
      description: 'Retrieve paginated list of public community posts',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number',
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Posts per page (max 50)',
      example: 10,
    }),
    ApiOkResponse({
      description: 'Posts retrieved successfully',
      type: [CommunityPostResponseDto],
    }),
  );

export const ApiGetPostById = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get post by ID',
      description: 'Retrieve detailed information about a specific post',
    }),
    ApiParam({
      name: 'postId',
      description: 'Post ID',
      example: '507f1f77bcf86cd799439011',
    }),
    ApiOkResponse({
      description: 'Post retrieved successfully',
      type: CommunityPostResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Post not found',
    }),
    ApiForbiddenResponse({
      description: 'Access denied to private post',
    }),
  );

export const ApiGetUserPosts = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get user posts',
      description: 'Retrieve posts created by a specific user',
    }),
    ApiParam({
      name: 'userId',
      description: 'User ID',
      example: '507f1f77bcf86cd799439013',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      example: 10,
    }),
    ApiOkResponse({
      description: 'User posts retrieved successfully',
      type: [CommunityPostResponseDto],
    }),
  );

export const ApiUpdatePost = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update post',
      description: 'Update post content or privacy settings (owner only)',
    }),
    ApiParam({
      name: 'postId',
      description: 'Post ID',
      example: '507f1f77bcf86cd799439011',
    }),
    ApiBody({
      type: UpdateCommunityPostDto,
      examples: {
        caption: {
          summary: 'Update caption',
          value: {
            caption: 'Updated: Amazing trip to Paris! Highly recommend! 🇫🇷✨',
          },
        },
        privacy: {
          summary: 'Change privacy',
          value: {
            visibility: 'FRIENDS_ONLY',
          },
        },
      },
    }),
    ApiBearerAuth('JWT-auth'),
    ApiOkResponse({
      description: 'Post updated successfully',
      type: CommunityPostResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication required',
    }),
    ApiForbiddenResponse({
      description: 'Only post owner can update',
    }),
    ApiNotFoundResponse({
      description: 'Post not found',
    }),
  );

export const ApiDeletePost = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Delete post',
      description: 'Delete post and all associated comments and likes (owner only)',
    }),
    ApiParam({
      name: 'postId',
      description: 'Post ID',
      example: '507f1f77bcf86cd799439011',
    }),
    ApiBearerAuth('JWT-auth'),
    ApiOkResponse({
      description: 'Post deleted successfully',
      schema: {
        example: {
          message: 'Post deleted successfully',
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication required',
    }),
    ApiForbiddenResponse({
      description: 'Only post owner can delete',
    }),
    ApiNotFoundResponse({
      description: 'Post not found',
    }),
  );

// ==================== COMMENT DECORATORS ====================

export const ApiCreateComment = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Create comment',
      description: 'Add a comment to a community post',
    }),
    ApiBody({
      type: CreateCommentDto,
      examples: {
        comment: {
          summary: 'Add comment',
          value: {
            postId: '507f1f77bcf86cd799439011',
            content: 'Looks amazing! How was the weather?',
          },
        },
      },
    }),
    ApiBearerAuth('JWT-auth'),
    ApiCreatedResponse({
      description: 'Comment created successfully',
      type: CommentResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication required',
    }),
    ApiForbiddenResponse({
      description: 'Cannot comment on private post',
    }),
    ApiNotFoundResponse({
      description: 'Post not found',
    }),
  );

export const ApiGetComments = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get post comments',
      description: 'Retrieve comments for a specific post',
    }),
    ApiParam({
      name: 'postId',
      description: 'Post ID',
      example: '507f1f77bcf86cd799439011',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      example: 20,
    }),
    ApiOkResponse({
      description: 'Comments retrieved successfully',
      type: [CommentResponseDto],
    }),
  );

export const ApiUpdateComment = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update comment',
      description: 'Update comment content (author only)',
    }),
    ApiParam({
      name: 'commentId',
      description: 'Comment ID',
      example: '507f1f77bcf86cd799439020',
    }),
    ApiBody({
      type: UpdateCommentDto,
      examples: {
        update: {
          summary: 'Update comment',
          value: {
            content: 'Updated: Looks absolutely amazing! How was the weather there?',
          },
        },
      },
    }),
    ApiBearerAuth('JWT-auth'),
    ApiOkResponse({
      description: 'Comment updated successfully',
      type: CommentResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication required',
    }),
    ApiForbiddenResponse({
      description: 'Only comment author can update',
    }),
    ApiNotFoundResponse({
      description: 'Comment not found',
    }),
  );

export const ApiDeleteComment = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Delete comment',
      description: 'Delete comment (author only)',
    }),
    ApiParam({
      name: 'commentId',
      description: 'Comment ID',
      example: '507f1f77bcf86cd799439020',
    }),
    ApiBearerAuth('JWT-auth'),
    ApiOkResponse({
      description: 'Comment deleted successfully',
      schema: {
        example: {
          message: 'Comment deleted successfully',
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication required',
    }),
    ApiForbiddenResponse({
      description: 'Only comment author can delete',
    }),
    ApiNotFoundResponse({
      description: 'Comment not found',
    }),
  );

// ==================== LIKE DECORATORS ====================

export const ApiToggleLike = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Toggle like',
      description: 'Like or unlike a post (toggle functionality)',
    }),
    ApiBody({
      type: CreateLikeDto,
      examples: {
        like: {
          summary: 'Toggle like',
          value: {
            postId: '507f1f77bcf86cd799439011',
          },
        },
      },
    }),
    ApiBearerAuth('JWT-auth'),
    ApiOkResponse({
      description: 'Like toggled successfully',
      schema: {
        example: {
          isLiked: true,
          likesCount: 16,
          message: 'Post liked successfully',
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication required',
    }),
    ApiForbiddenResponse({
      description: 'Cannot like private post',
    }),
    ApiNotFoundResponse({
      description: 'Post not found',
    }),
  );

export const ApiGetLikes = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get post likes',
      description: 'Retrieve users who liked a specific post',
    }),
    ApiParam({
      name: 'postId',
      description: 'Post ID',
      example: '507f1f77bcf86cd799439011',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      example: 20,
    }),
    ApiOkResponse({
      description: 'Likes retrieved successfully',
      type: [LikeResponseDto],
    }),
  );
