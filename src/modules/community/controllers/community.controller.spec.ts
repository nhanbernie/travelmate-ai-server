import { Test, TestingModule } from '@nestjs/testing';
import { CommunityController } from './community.controller';
import { CommunityService } from '../services/community.service';
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
import { Visibility } from '../schemas/community-post.schema';

describe('CommunityController', () => {
  let controller: CommunityController;
  let service: CommunityService;

  const mockCommunityService = {
    createPost: jest.fn(),
    getPublicPosts: jest.fn(),
    getPostById: jest.fn(),
    getUserPosts: jest.fn(),
    updatePost: jest.fn(),
    deletePost: jest.fn(),
    createComment: jest.fn(),
    getCommentsByPost: jest.fn(),
    updateComment: jest.fn(),
    deleteComment: jest.fn(),
    toggleLike: jest.fn(),
    getPostLikes: jest.fn(),
  };

  const mockPost: CommunityPostResponseDto = {
    postId: '507f1f77bcf86cd799439011',
    itineraryId: '507f1f77bcf86cd799439012',
    userId: '507f1f77bcf86cd799439013',
    caption: 'Amazing trip to Paris!',
    visibility: Visibility.PUBLIC,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      userId: '507f1f77bcf86cd799439013',
      fullName: 'John Doe',
      email: 'john@example.com',
    },
    itinerary: {
      itineraryId: '507f1f77bcf86cd799439012',
      destination: 'Paris, France',
      startDate: '2024-01-15',
      endDate: '2024-01-20',
      numberOfTravelers: 2,
      tripType: 'COUPLE',
    },
    likesCount: 5,
    commentsCount: 3,
    isLikedByCurrentUser: false,
    recentComments: [],
  };

  const mockComment: CommentResponseDto = {
    commentId: '507f1f77bcf86cd799439014',
    postId: '507f1f77bcf86cd799439011',
    userId: '507f1f77bcf86cd799439013',
    content: 'Great photos!',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      userId: '507f1f77bcf86cd799439013',
      fullName: 'John Doe',
      email: 'john@example.com',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommunityController],
      providers: [
        {
          provide: CommunityService,
          useValue: mockCommunityService,
        },
      ],
    }).compile();

    controller = module.get<CommunityController>(CommunityController);
    service = module.get<CommunityService>(CommunityService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createPost', () => {
    it('should create a new post', async () => {
      const createPostDto: CreateCommunityPostDto = {
        itineraryId: '507f1f77bcf86cd799439012',
        caption: 'Amazing trip to Paris!',
        visibility: Visibility.PUBLIC,
      };

      const mockRequest = { user: { userId: '507f1f77bcf86cd799439013' } };
      mockCommunityService.createPost.mockResolvedValue(mockPost);

      const result = await controller.createPost(createPostDto, mockRequest);

      expect(result).toEqual(mockPost);
      expect(service.createPost).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439013',
        createPostDto,
      );
    });
  });

  describe('getPublicPosts', () => {
    it('should return public posts', async () => {
      const mockRequest = { user: { userId: '507f1f77bcf86cd799439013' } };
      mockCommunityService.getPublicPosts.mockResolvedValue([mockPost]);

      const result = await controller.getPublicPosts('1', '10', mockRequest);

      expect(result).toEqual([mockPost]);
      expect(service.getPublicPosts).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439013',
        1,
        10,
      );
    });
  });

  describe('getPostById', () => {
    it('should return a specific post', async () => {
      const mockRequest = { user: { userId: '507f1f77bcf86cd799439013' } };
      mockCommunityService.getPostById.mockResolvedValue(mockPost);

      const result = await controller.getPostById(
        '507f1f77bcf86cd799439011',
        mockRequest,
      );

      expect(result).toEqual(mockPost);
      expect(service.getPostById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439013',
      );
    });
  });

  describe('createComment', () => {
    it('should create a new comment', async () => {
      const createCommentDto: CreateCommentDto = {
        postId: '507f1f77bcf86cd799439011',
        content: 'Great photos!',
      };

      const mockRequest = { user: { userId: '507f1f77bcf86cd799439013' } };
      mockCommunityService.createComment.mockResolvedValue(mockComment);

      const result = await controller.createComment(
        createCommentDto,
        mockRequest,
      );

      expect(result).toEqual(mockComment);
      expect(service.createComment).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439013',
        createCommentDto,
      );
    });
  });

  describe('toggleLike', () => {
    it('should toggle like on a post', async () => {
      const createLikeDto: CreateLikeDto = {
        postId: '507f1f77bcf86cd799439011',
      };

      const mockResponse = {
        isLiked: true,
        likesCount: 6,
        message: 'Post liked successfully',
      };

      const mockRequest = { user: { userId: '507f1f77bcf86cd799439013' } };
      mockCommunityService.toggleLike.mockResolvedValue(mockResponse);

      const result = await controller.toggleLike(createLikeDto, mockRequest);

      expect(result).toEqual(mockResponse);
      expect(service.toggleLike).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439013',
        createLikeDto,
      );
    });
  });

  describe('deletePost', () => {
    it('should delete a post', async () => {
      const mockResponse = { message: 'Post deleted successfully' };
      const mockRequest = { user: { userId: '507f1f77bcf86cd799439013' } };
      mockCommunityService.deletePost.mockResolvedValue(mockResponse);

      const result = await controller.deletePost(
        '507f1f77bcf86cd799439011',
        mockRequest,
      );

      expect(result).toEqual(mockResponse);
      expect(service.deletePost).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439013',
      );
    });
  });
});
