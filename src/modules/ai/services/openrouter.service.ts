import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  OpenRouterRequest,
  OpenRouterResponse,
  OpenRouterError,
  ChatCompletionResponse,
  AIServiceConfig,
} from '../interfaces/openrouter.interface';

@Injectable()
export class OpenRouterService {
  private readonly logger = new Logger(OpenRouterService.name);
  private readonly config: AIServiceConfig;

  constructor(private configService: ConfigService) {
    this.config = {
      apiKey: this.configService.get<string>('openrouter.apiKey') || '',
      baseUrl:
        this.configService.get<string>('openrouter.baseUrl') ||
        'https://openrouter.ai/api/v1',
      siteUrl:
        this.configService.get<string>('openrouter.siteUrl') ||
        'http://localhost:3333',
      siteName:
        this.configService.get<string>('openrouter.siteName') ||
        'TravelMate AI',
      defaultModel: 'google/gemini-2.0-flash-001',
      timeout: 30000, // 30 seconds
      maxRetries: 3,
    };

    if (!this.config.apiKey) {
      throw new Error(
        'OpenRouter API key is required. Please set OPENROUTER_API_KEY in your environment variables.',
      );
    }
  }

  async chatCompletion(
    request: OpenRouterRequest,
  ): Promise<ChatCompletionResponse> {
    try {
      this.logger.log(
        `Making chat completion request with model: ${request.model}`,
      );

      const response = await this.makeRequest('/chat/completions', request);

      if (this.isErrorResponse(response)) {
        throw new BadRequestException(
          `OpenRouter API error: ${response.error.message}`,
        );
      }

      const openRouterResponse = response as OpenRouterResponse;

      if (
        !openRouterResponse.choices ||
        openRouterResponse.choices.length === 0
      ) {
        throw new BadRequestException('No response choices returned from API');
      }

      const choice = openRouterResponse.choices[0];

      return {
        id: openRouterResponse.id,
        model: openRouterResponse.model,
        content: choice.message.content,
        usage: {
          promptTokens: openRouterResponse.usage.prompt_tokens,
          completionTokens: openRouterResponse.usage.completion_tokens,
          totalTokens: openRouterResponse.usage.total_tokens,
        },
        finishReason: choice.finish_reason,
        createdAt: new Date(openRouterResponse.created * 1000),
      };
    } catch (error) {
      this.logger.error('Chat completion failed', error.stack);
      throw error;
    }
  }

  async simpleTextCompletion(
    message: string,
    model: string = this.config.defaultModel,
    temperature: number = 0.7,
  ): Promise<ChatCompletionResponse> {
    const request: OpenRouterRequest = {
      model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: message,
            },
          ],
        },
      ],
      temperature,
    };

    return this.chatCompletion(request);
  }

  async imageAnalysis(
    imageUrl: string,
    question: string = 'What is in this image?',
    model: string = this.config.defaultModel,
  ): Promise<ChatCompletionResponse> {
    const request: OpenRouterRequest = {
      model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: question,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
    };

    return this.chatCompletion(request);
  }

  private async makeRequest(
    endpoint: string,
    data: any,
    retryCount: number = 0,
  ): Promise<OpenRouterResponse | OpenRouterError> {
    try {
      const url = `${this.config.baseUrl}${endpoint}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'HTTP-Referer': this.config.siteUrl,
          'X-Title': this.config.siteName,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        this.logger.error(`API request failed: ${response.status}`, errorData);
        return errorData as OpenRouterError;
      }

      return await response.json();
    } catch (error) {
      this.logger.error(
        `Request failed (attempt ${retryCount + 1})`,
        error.stack,
      );

      if (retryCount < this.config.maxRetries) {
        this.logger.log(
          `Retrying request (${retryCount + 1}/${this.config.maxRetries})`,
        );
        await this.delay(1000 * (retryCount + 1)); // Exponential backoff
        return this.makeRequest(endpoint, data, retryCount + 1);
      }

      throw error;
    }
  }

  private isErrorResponse(
    response: OpenRouterResponse | OpenRouterError,
  ): response is OpenRouterError {
    return 'error' in response;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.simpleTextCompletion(
        'Hello',
        this.config.defaultModel,
        0.1,
      );
      return !!response.content;
    } catch (error) {
      this.logger.error('Health check failed', error.stack);
      return false;
    }
  }
}
