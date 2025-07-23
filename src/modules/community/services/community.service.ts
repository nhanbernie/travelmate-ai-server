import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CommunityPost, Visibility } from '../schemas/community-post.schema';
import { Comment } from '../schemas/comment.schema';
import { Like } from '../schemas/like.schema';
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

@Injectable()
export class CommunityService {
  constructor(
    @InjectModel(CommunityPost.name)
    private communityPostModel: Model<CommunityPost>,
    @InjectModel(Comment.name)
    private commentModel: Model<Comment>,
    @InjectModel(Like.name)
    private likeModel: Model<Like>,
  ) {}

  // ==================== COMMUNITY POST METHODS ====================

  async createPost(
    userId: string,
    createPostDto: CreateCommunityPostDto,
  ): Promise<CommunityPostResponseDto> {
    // Validate userId and itineraryId are valid ObjectIds
    if (
      !Types.ObjectId.isValid(userId) ||
      !Types.ObjectId.isValid(createPostDto.itineraryId)
    ) {
      throw new Error('Invalid userId or itineraryId format');
    }

    const userObjectId = new Types.ObjectId(userId);
    const itineraryObjectId = new Types.ObjectId(createPostDto.itineraryId);

    // Check if post already exists for this itinerary
    const existingPost = await this.communityPostModel
      .findOne({ itineraryId: itineraryObjectId, userId: userObjectId })
      .exec();

    if (existingPost) {
      throw new ConflictException('Post already exists for this itinerary');
    }

    const newPost = new this.communityPostModel({
      ...createPostDto,
      userId: userObjectId,
      itineraryId: itineraryObjectId,
    });

    const savedPost = await newPost.save();
    return this.getPostById(savedPost._id!.toString(), userId);
  }

  async getPublicPosts(
    currentUserId?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<CommunityPostResponseDto[]> {
    const skip = (page - 1) * limit;

    const posts = await this.communityPostModel
      .find({ visibility: Visibility.PUBLIC })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'fullName email')
      .populate(
        'itineraryId',
        'destination startDate endDate numberOfTravelers tripType',
      )
      .exec();

    const postsWithStats = await Promise.all(
      posts.map(async (post) => {
        const [likesCount, commentsCount, isLiked, recentComments] =
          await Promise.all([
            this.likeModel.countDocuments({ postId: post._id }),
            this.commentModel.countDocuments({ postId: post._id }),
            currentUserId
              ? this.isPostLikedByUser(post._id!.toString(), currentUserId)
              : false,
            this.getRecentComments(post._id!.toString(), 3),
          ]);

        return this.mapToPostResponse(
          post,
          likesCount,
          commentsCount,
          isLiked,
          recentComments,
        );
      }),
    );

    return postsWithStats;
  }

  async getPostById(
    postId: string,
    currentUserId?: string,
  ): Promise<CommunityPostResponseDto> {
    if (!Types.ObjectId.isValid(postId)) {
      throw new Error('Invalid postId format');
    }

    const post = await this.communityPostModel
      .findById(postId)
      .populate('userId', 'fullName email')
      .populate(
        'itineraryId',
        'destination startDate endDate numberOfTravelers tripType',
      )
      .exec();

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check visibility permissions
    if (
      post.visibility === Visibility.PRIVATE &&
      (!currentUserId || post.userId._id.toString() !== currentUserId)
    ) {
      throw new ForbiddenException(
        'You do not have permission to view this post',
      );
    }

    const [likesCount, commentsCount, isLiked, recentComments] =
      await Promise.all([
        this.likeModel.countDocuments({ postId: post._id }),
        this.commentModel.countDocuments({ postId: post._id }),
        currentUserId ? this.isPostLikedByUser(postId, currentUserId) : false,
        this.getRecentComments(postId, 5),
      ]);

    return this.mapToPostResponse(
      post,
      likesCount,
      commentsCount,
      isLiked,
      recentComments,
    );
  }

  async getUserPosts(
    userId: string,
    currentUserId?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<CommunityPostResponseDto[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid userId format');
    }

    const skip = (page - 1) * limit;
    const userObjectId = new Types.ObjectId(userId);

    // Determine visibility filter based on whether current user is viewing their own posts
    let visibilityFilter = {};
    if (!currentUserId || currentUserId !== userId) {
      visibilityFilter = {
        visibility: { $in: [Visibility.PUBLIC, Visibility.FRIENDS_ONLY] },
      };
    }

    const posts = await this.communityPostModel
      .find({ userId: userObjectId, ...visibilityFilter })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'fullName email')
      .populate(
        'itineraryId',
        'destination startDate endDate numberOfTravelers tripType',
      )
      .exec();

    const postsWithStats = await Promise.all(
      posts.map(async (post) => {
        const [likesCount, commentsCount, isLiked, recentComments] =
          await Promise.all([
            this.likeModel.countDocuments({ postId: post._id }),
            this.commentModel.countDocuments({ postId: post._id }),
            currentUserId
              ? this.isPostLikedByUser(post._id!.toString(), currentUserId)
              : false,
            this.getRecentComments(post._id!.toString(), 3),
          ]);

        return this.mapToPostResponse(
          post,
          likesCount,
          commentsCount,
          isLiked,
          recentComments,
        );
      }),
    );

    return postsWithStats;
  }

  async updatePost(
    postId: string,
    userId: string,
    updatePostDto: UpdateCommunityPostDto,
  ): Promise<CommunityPostResponseDto> {
    if (!Types.ObjectId.isValid(postId) || !Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid postId or userId format');
    }

    const post = await this.communityPostModel.findById(postId).exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.userId.toString() !== userId) {
      throw new ForbiddenException('You can only update your own posts');
    }

    const updatedPost = await this.communityPostModel
      .findByIdAndUpdate(postId, updatePostDto, { new: true })
      .populate('userId', 'fullName email')
      .populate(
        'itineraryId',
        'destination startDate endDate numberOfTravelers tripType',
      )
      .exec();

    const [likesCount, commentsCount, isLiked, recentComments] =
      await Promise.all([
        this.likeModel.countDocuments({ postId: updatedPost!._id }),
        this.commentModel.countDocuments({ postId: updatedPost!._id }),
        this.isPostLikedByUser(postId, userId),
        this.getRecentComments(postId, 5),
      ]);

    return this.mapToPostResponse(
      updatedPost,
      likesCount,
      commentsCount,
      isLiked,
      recentComments,
    );
  }

  async deletePost(
    postId: string,
    userId: string,
  ): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(postId) || !Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid postId or userId format');
    }

    const post = await this.communityPostModel.findById(postId).exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.userId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    // Delete associated comments and likes
    await Promise.all([
      this.commentModel.deleteMany({ postId: post._id }),
      this.likeModel.deleteMany({ postId: post._id }),
    ]);

    // Delete the post
    await this.communityPostModel.findByIdAndDelete(postId);

    return { message: 'Post deleted successfully' };
  }

  // ==================== COMMENT METHODS ====================

  async createComment(
    userId: string,
    createCommentDto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    if (
      !Types.ObjectId.isValid(userId) ||
      !Types.ObjectId.isValid(createCommentDto.postId)
    ) {
      throw new Error('Invalid userId or postId format');
    }

    const userObjectId = new Types.ObjectId(userId);
    const postObjectId = new Types.ObjectId(createCommentDto.postId);

    // Check if post exists and is accessible
    const post = await this.communityPostModel.findById(postObjectId).exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if user can comment on this post (only public and friends_only posts)
    if (
      post.visibility === Visibility.PRIVATE &&
      post.userId.toString() !== userId
    ) {
      throw new ForbiddenException('You cannot comment on this private post');
    }

    const newComment = new this.commentModel({
      ...createCommentDto,
      userId: userObjectId,
      postId: postObjectId,
    });

    const savedComment = await newComment.save();

    // Populate user info
    const populatedComment = await this.commentModel
      .findById(savedComment._id)
      .populate('userId', 'fullName email')
      .exec();

    return {
      commentId: populatedComment!._id!.toString(),
      postId: populatedComment!.postId.toString(),
      userId: populatedComment!.userId._id.toString(),
      content: populatedComment!.content,
      createdAt: populatedComment!.createdAt,
      updatedAt: populatedComment!.updatedAt,
      user: {
        userId: populatedComment!.userId._id.toString(),
        fullName: (populatedComment!.userId as any).fullName,
        email: (populatedComment!.userId as any).email,
      },
    };
  }

  async getCommentsByPost(
    postId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<CommentResponseDto[]> {
    if (!Types.ObjectId.isValid(postId)) {
      throw new Error('Invalid postId format');
    }

    const skip = (page - 1) * limit;

    const comments = await this.commentModel
      .find({ postId: new Types.ObjectId(postId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'fullName email')
      .exec();

    return comments.map((comment) => ({
      commentId: comment._id!.toString(),
      postId: comment.postId.toString(),
      userId: comment.userId._id.toString(),
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: {
        userId: comment.userId._id.toString(),
        fullName: (comment.userId as any).fullName,
        email: (comment.userId as any).email,
      },
    }));
  }

  async updateComment(
    commentId: string,
    userId: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<CommentResponseDto> {
    if (!Types.ObjectId.isValid(commentId) || !Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid commentId or userId format');
    }

    const comment = await this.commentModel.findById(commentId).exec();
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId.toString() !== userId) {
      throw new ForbiddenException('You can only update your own comments');
    }

    const updatedComment = await this.commentModel
      .findByIdAndUpdate(commentId, updateCommentDto, { new: true })
      .populate('userId', 'fullName email')
      .exec();

    return {
      commentId: updatedComment!._id!.toString(),
      postId: updatedComment!.postId.toString(),
      userId: updatedComment!.userId._id.toString(),
      content: updatedComment!.content,
      createdAt: updatedComment!.createdAt,
      updatedAt: updatedComment!.updatedAt,
      user: {
        userId: updatedComment!.userId._id.toString(),
        fullName: (updatedComment!.userId as any).fullName,
        email: (updatedComment!.userId as any).email,
      },
    };
  }

  async deleteComment(
    commentId: string,
    userId: string,
  ): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(commentId) || !Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid commentId or userId format');
    }

    const comment = await this.commentModel.findById(commentId).exec();
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentModel.findByIdAndDelete(commentId);
    return { message: 'Comment deleted successfully' };
  }

  // ==================== LIKE METHODS ====================

  async toggleLike(
    userId: string,
    createLikeDto: CreateLikeDto,
  ): Promise<{
    isLiked: boolean;
    likesCount: number;
    message: string;
  }> {
    if (
      !Types.ObjectId.isValid(userId) ||
      !Types.ObjectId.isValid(createLikeDto.postId)
    ) {
      throw new Error('Invalid userId or postId format');
    }

    const userObjectId = new Types.ObjectId(userId);
    const postObjectId = new Types.ObjectId(createLikeDto.postId);

    // Check if post exists
    const post = await this.communityPostModel.findById(postObjectId).exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if user can like this post (only public and friends_only posts)
    if (
      post.visibility === Visibility.PRIVATE &&
      post.userId.toString() !== userId
    ) {
      throw new ForbiddenException('You cannot like this private post');
    }

    // Check if like already exists
    const existingLike = await this.likeModel
      .findOne({ userId: userObjectId, postId: postObjectId })
      .exec();

    let isLiked: boolean;
    let message: string;

    if (existingLike) {
      // Unlike: remove the like
      await this.likeModel.findByIdAndDelete(existingLike._id);
      isLiked = false;
      message = 'Post unliked successfully';
    } else {
      // Like: create new like
      const newLike = new this.likeModel({
        userId: userObjectId,
        postId: postObjectId,
      });
      await newLike.save();
      isLiked = true;
      message = 'Post liked successfully';
    }

    // Get updated likes count
    const likesCount = await this.likeModel.countDocuments({
      postId: postObjectId,
    });

    return { isLiked, likesCount, message };
  }

  async getPostLikes(
    postId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<LikeResponseDto[]> {
    if (!Types.ObjectId.isValid(postId)) {
      throw new Error('Invalid postId format');
    }

    const skip = (page - 1) * limit;

    const likes = await this.likeModel
      .find({ postId: new Types.ObjectId(postId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'fullName email')
      .exec();

    return likes.map((like) => ({
      likeId: like._id!.toString(),
      userId: like.userId._id.toString(),
      postId: like.postId.toString(),
      createdAt: like.createdAt,
      user: {
        userId: like.userId._id.toString(),
        fullName: (like.userId as any).fullName,
        email: (like.userId as any).email,
      },
    }));
  }

  // ==================== HELPER METHODS ====================

  private async isPostLikedByUser(
    postId: string,
    userId: string,
  ): Promise<boolean> {
    const like = await this.likeModel
      .findOne({
        postId: new Types.ObjectId(postId),
        userId: new Types.ObjectId(userId),
      })
      .exec();
    return !!like;
  }

  private async getRecentComments(
    postId: string,
    limit: number,
  ): Promise<CommentResponseDto[]> {
    const comments = await this.commentModel
      .find({ postId: new Types.ObjectId(postId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'fullName email')
      .exec();

    return comments.map((comment) => ({
      commentId: comment._id!.toString(),
      postId: comment.postId.toString(),
      userId: comment.userId._id.toString(),
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: {
        userId: comment.userId._id.toString(),
        fullName: (comment.userId as any).fullName,
        email: (comment.userId as any).email,
      },
    }));
  }

  private mapToPostResponse(
    post: any,
    likesCount: number,
    commentsCount: number,
    isLikedByCurrentUser: boolean,
    recentComments: CommentResponseDto[],
  ): CommunityPostResponseDto {
    return {
      postId: post._id.toString(),
      itineraryId: post.itineraryId._id.toString(),
      userId: post.userId._id.toString(),
      caption: post.caption,
      visibility: post.visibility,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      user: {
        userId: post.userId._id.toString(),
        fullName: post.userId.fullName,
        email: post.userId.email,
      },
      itinerary: {
        itineraryId: post.itineraryId._id.toString(),
        destination: post.itineraryId.destination,
        startDate: post.itineraryId.startDate.toISOString().split('T')[0],
        endDate: post.itineraryId.endDate.toISOString().split('T')[0],
        numberOfTravelers: post.itineraryId.numberOfTravelers,
        tripType: post.itineraryId.tripType,
      },
      likesCount,
      commentsCount,
      isLikedByCurrentUser,
      recentComments,
    };
  }
}
