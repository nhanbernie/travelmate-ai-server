import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OpenRouterService } from './services/openrouter.service';
import {
  ChatCompletionRequestDto,
  SimpleTextRequestDto,
  ImageAnalysisRequestDto,
} from './dto/ai-chat.dto';
import { ChatCompletionResponse } from './interfaces/openrouter.interface';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(private readonly openRouterService: OpenRouterService) {}

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

  @Get('health')
  async healthCheck(): Promise<{ status: string; openrouter: boolean }> {
    const openrouterHealth = await this.openRouterService.healthCheck();

    return {
      status: openrouterHealth ? 'healthy' : 'unhealthy',
      openrouter: openrouterHealth,
    };
  }
}
