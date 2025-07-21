import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OpenRouterService } from './services/openrouter.service';
import { TravelAIService } from './services/travel-ai.service';
import {
  ChatCompletionRequestDto,
  SimpleTextRequestDto,
  ImageAnalysisRequestDto,
  TravelPlanRequestDto,
} from './dto/ai-chat.dto';
import { ChatCompletionResponse } from './interfaces/openrouter.interface';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(
    private readonly openRouterService: OpenRouterService,
    private readonly travelAIService: TravelAIService,
  ) {}

  @Post('chat')
  async chatCompletion(
    @Body() chatRequest: ChatCompletionRequestDto,
  ): Promise<ChatCompletionResponse> {
    try {
      const openRouterRequest = {
        model: chatRequest.model || 'google/gemini-2.0-flash-001',
        messages: chatRequest.messages.map((msg) => ({
          role: msg.role,
          content: msg.content.map((content) => ({
            type: content.type,
            text: content.text,
            image_url: content.image_url,
          })),
        })),
        temperature: chatRequest.temperature,
        max_tokens: chatRequest.max_tokens,
        top_p: chatRequest.top_p,
        frequency_penalty: chatRequest.frequency_penalty,
        presence_penalty: chatRequest.presence_penalty,
      };

      return await this.openRouterService.chatCompletion(openRouterRequest);
    } catch (error) {
      throw new BadRequestException(`Chat completion failed: ${error.message}`);
    }
  }

  @Post('text')
  async simpleTextCompletion(
    @Body() textRequest: SimpleTextRequestDto,
  ): Promise<ChatCompletionResponse> {
    try {
      return await this.openRouterService.simpleTextCompletion(
        textRequest.message,
        textRequest.model,
        textRequest.temperature,
      );
    } catch (error) {
      throw new BadRequestException(`Text completion failed: ${error.message}`);
    }
  }

  @Post('image-analysis')
  async analyzeImage(
    @Body() imageRequest: ImageAnalysisRequestDto,
  ): Promise<ChatCompletionResponse> {
    try {
      return await this.openRouterService.imageAnalysis(
        imageRequest.imageUrl,
        imageRequest.question,
        imageRequest.model,
      );
    } catch (error) {
      throw new BadRequestException(`Image analysis failed: ${error.message}`);
    }
  }

  @Post('travel/plan')
  async generateTravelPlan(
    @Body() travelRequest: TravelPlanRequestDto,
  ): Promise<ChatCompletionResponse> {
    try {
      return await this.travelAIService.generateTravelPlan(
        travelRequest.destination,
        travelRequest.duration,
        travelRequest.budget,
        travelRequest.interests,
        travelRequest.travelStyle,
        travelRequest.model,
      );
    } catch (error) {
      throw new BadRequestException(
        `Travel plan generation failed: ${error.message}`,
      );
    }
  }

  @Get('travel/destination-info')
  async getDestinationInfo(
    @Query('destination') destination: string,
    @Query('model') model?: string,
  ): Promise<ChatCompletionResponse> {
    if (!destination) {
      throw new BadRequestException('Destination is required');
    }

    try {
      return await this.travelAIService.getDestinationInfo(destination, model);
    } catch (error) {
      throw new BadRequestException(
        `Destination info failed: ${error.message}`,
      );
    }
  }

  @Post('travel/destination-image')
  async analyzeDestinationImage(
    @Body() imageRequest: { imageUrl: string; model?: string },
  ): Promise<ChatCompletionResponse> {
    if (!imageRequest.imageUrl) {
      throw new BadRequestException('Image URL is required');
    }

    try {
      return await this.travelAIService.analyzeDestinationImage(
        imageRequest.imageUrl,
        imageRequest.model,
      );
    } catch (error) {
      throw new BadRequestException(
        `Destination image analysis failed: ${error.message}`,
      );
    }
  }

  @Get('travel/itinerary')
  async generateItinerary(
    @Query('destination') destination: string,
    @Query('days') days: string,
    @Query('interests') interests?: string,
    @Query('model') model?: string,
  ): Promise<ChatCompletionResponse> {
    if (!destination || !days) {
      throw new BadRequestException('Destination and days are required');
    }

    const daysNumber = parseInt(days, 10);
    if (isNaN(daysNumber) || daysNumber < 1 || daysNumber > 30) {
      throw new BadRequestException('Days must be a number between 1 and 30');
    }

    try {
      const interestsArray = interests
        ? interests.split(',').map((i) => i.trim())
        : undefined;

      return await this.travelAIService.generateItinerary(
        destination,
        daysNumber,
        interestsArray,
        model,
      );
    } catch (error) {
      throw new BadRequestException(
        `Itinerary generation failed: ${error.message}`,
      );
    }
  }

  @Get('travel/recommendations')
  async getLocalRecommendations(
    @Query('destination') destination: string,
    @Query('category')
    category:
      | 'restaurants'
      | 'activities'
      | 'shopping'
      | 'nightlife'
      | 'all' = 'all',
    @Query('model') model?: string,
  ): Promise<ChatCompletionResponse> {
    if (!destination) {
      throw new BadRequestException('Destination is required');
    }

    const validCategories = [
      'restaurants',
      'activities',
      'shopping',
      'nightlife',
      'all',
    ];
    if (!validCategories.includes(category)) {
      throw new BadRequestException(
        `Category must be one of: ${validCategories.join(', ')}`,
      );
    }

    try {
      return await this.travelAIService.getLocalRecommendations(
        destination,
        category,
        model,
      );
    } catch (error) {
      throw new BadRequestException(`Recommendations failed: ${error.message}`);
    }
  }

  @Get('travel/budget')
  async getBudgetEstimate(
    @Query('destination') destination: string,
    @Query('duration') duration: string,
    @Query('style') style: 'budget' | 'mid-range' | 'luxury' = 'mid-range',
    @Query('groupSize') groupSize: string = '1',
    @Query('model') model?: string,
  ): Promise<ChatCompletionResponse> {
    if (!destination || !duration) {
      throw new BadRequestException('Destination and duration are required');
    }

    const validStyles = ['budget', 'mid-range', 'luxury'];
    if (!validStyles.includes(style)) {
      throw new BadRequestException(
        `Style must be one of: ${validStyles.join(', ')}`,
      );
    }

    const groupSizeNumber = parseInt(groupSize, 10);
    if (isNaN(groupSizeNumber) || groupSizeNumber < 1 || groupSizeNumber > 20) {
      throw new BadRequestException(
        'Group size must be a number between 1 and 20',
      );
    }

    try {
      return await this.travelAIService.getBudgetEstimate(
        destination,
        duration,
        style,
        groupSizeNumber,
        model,
      );
    } catch (error) {
      throw new BadRequestException(`Budget estimate failed: ${error.message}`);
    }
  }

  @Get('health')
  async healthCheck(): Promise<{ status: string; openrouter: boolean }> {
    const openrouterHealth = await this.openRouterService.healthCheck();

    return {
      status: openrouterHealth ? 'healthy' : 'unhealthy',
      openrouter: openrouterHealth,
    };
  }
}
