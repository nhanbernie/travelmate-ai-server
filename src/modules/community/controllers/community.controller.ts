import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommunityService } from '../services/community.service';
import {
  ApiCreatePost,
  ApiGetPublicPosts,
  ApiGetPostById,
  ApiGetUserPosts,
  ApiUpdatePost,
  ApiDeletePost,
  ApiCreateComment,
  ApiGetComments,
  ApiUpdateComment,
  ApiDeleteComment,
  ApiToggleLike,
  ApiGetLikes,
} from '../decorators/swagger.decorators';
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

@ApiTags('Community')
@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  // ==================== COMMUNITY POST ENDPOINTS ====================

  @Post('posts')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatePost()
  async createPost(
    @Body() createPostDto: CreateCommunityPostDto,
    @Request() req: any,
  ): Promise<CommunityPostResponseDto> {
    const userId = req.user?.userId || 'temp-user-id'; // TODO: Replace with actual auth
    return this.communityService.createPost(userId, createPostDto);
  }

  @Get('posts')
  @ApiGetPublicPosts()
  async getPublicPosts(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Request() req: any,
  ): Promise<CommunityPostResponseDto[]> {
    const currentUserId = req.user?.userId; // Optional for public posts
    return this.communityService.getPublicPosts(
      currentUserId,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Get('posts/:postId')
  @ApiGetPostById()
  async getPostById(
    @Param('postId') postId: string,
    @Request() req: any,
  ): Promise<CommunityPostResponseDto> {
    const currentUserId = req.user?.userId;
    return this.communityService.getPostById(postId, currentUserId);
  }

  @Get('users/:userId/posts')
  @ApiGetUserPosts()
  async getUserPosts(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Request() req: any,
  ): Promise<CommunityPostResponseDto[]> {
    const currentUserId = req.user?.userId;
    return this.communityService.getUserPosts(
      userId,
      currentUserId,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Put('posts/:postId')
  @ApiUpdatePost()
  async updatePost(
    @Param('postId') postId: string,
    @Body() updatePostDto: UpdateCommunityPostDto,
    @Request() req: any,
  ): Promise<CommunityPostResponseDto> {
    const userId = req.user?.userId || 'temp-user-id'; // TODO: Replace with actual auth
    return this.communityService.updatePost(postId, userId, updatePostDto);
  }

  @Delete('posts/:postId')
  @HttpCode(HttpStatus.OK)
  @ApiDeletePost()
  async deletePost(
    @Param('postId') postId: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    const userId = req.user?.userId || 'temp-user-id'; // TODO: Replace with actual auth
    return this.communityService.deletePost(postId, userId);
  }

  // ==================== COMMENT ENDPOINTS ====================

  @Post('comments')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateComment()
  async createComment(
    @Body() createCommentDto: CreateCommentDto,
    @Request() req: any,
  ): Promise<CommentResponseDto> {
    const userId = req.user?.userId || 'temp-user-id'; // TODO: Replace with actual auth
    return this.communityService.createComment(userId, createCommentDto);
  }

  @Get('posts/:postId/comments')
  @ApiGetComments()
  async getCommentsByPost(
    @Param('postId') postId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ): Promise<CommentResponseDto[]> {
    return this.communityService.getCommentsByPost(
      postId,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Put('comments/:commentId')
  @ApiUpdateComment()
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req: any,
  ): Promise<CommentResponseDto> {
    const userId = req.user?.userId || 'temp-user-id'; // TODO: Replace with actual auth
    return this.communityService.updateComment(
      commentId,
      userId,
      updateCommentDto,
    );
  }

  @Delete('comments/:commentId')
  @HttpCode(HttpStatus.OK)
  @ApiDeleteComment()
  async deleteComment(
    @Param('commentId') commentId: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    const userId = req.user?.userId || 'temp-user-id'; // TODO: Replace with actual auth
    return this.communityService.deleteComment(commentId, userId);
  }

  // ==================== LIKE ENDPOINTS ====================

  @Post('likes')
  @HttpCode(HttpStatus.OK)
  @ApiToggleLike()
  async toggleLike(
    @Body() createLikeDto: CreateLikeDto,
    @Request() req: any,
  ): Promise<{
    isLiked: boolean;
    likesCount: number;
    message: string;
  }> {
    const userId = req.user?.userId || 'temp-user-id'; // TODO: Replace with actual auth
    return this.communityService.toggleLike(userId, createLikeDto);
  }

  @Get('posts/:postId/likes')
  @ApiGetLikes()
  async getPostLikes(
    @Param('postId') postId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ): Promise<LikeResponseDto[]> {
    return this.communityService.getPostLikes(
      postId,
      parseInt(page),
      parseInt(limit),
    );
  }
}
