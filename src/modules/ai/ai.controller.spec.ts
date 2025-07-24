import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { AIController } from './ai.controller';
import { OpenRouterService } from './services/openrouter.service';
import {
  SimpleTextRequestDto,
  ImageAnalysisRequestDto,
  MessageRole,
  ContentType,
} from './dto/ai-chat.dto';

describe('AIController', () => {
  let controller: AIController;
  let openRouterService: OpenRouterService;

  const mockChatResponse = {
    id: 'test-id',
    model: 'google/gemini-2.0-flash-001',
    content: 'Test AI response',
    usage: {
      promptTokens: 10,
      completionTokens: 20,
      totalTokens: 30,
    },
    finishReason: 'stop',
    createdAt: new Date(),
  };

  const mockOpenRouterService = {
    simpleTextCompletion: jest.fn().mockResolvedValue(mockChatResponse),
    imageAnalysis: jest.fn().mockResolvedValue(mockChatResponse),
    chatCompletion: jest.fn().mockResolvedValue(mockChatResponse),
    healthCheck: jest.fn().mockResolvedValue(true),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        'openrouter.apiKey': 'test-api-key',
        'openrouter.baseUrl': 'https://openrouter.ai/api/v1',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AIController],
      providers: [
        {
          provide: OpenRouterService,
          useValue: mockOpenRouterService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<AIController>(AIController);
    openRouterService = module.get<OpenRouterService>(OpenRouterService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('chatCompletion', () => {
    it('should return chat completion response', async () => {
      const request = {
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: MessageRole.USER,
            content: [
              {
                type: ContentType.TEXT,
                text: 'Hello, how are you?',
              },
            ],
          },
        ],
        temperature: 0.7,
        max_tokens: 100,
      };

      const result = await controller.chatCompletion(request);

      expect(result).toEqual(mockChatResponse);
      expect(openRouterService.chatCompletion).toHaveBeenCalled();
    });
  });

  describe('simpleTextCompletion', () => {
    it('should return simple text completion response', async () => {
      const request: SimpleTextRequestDto = {
        message: 'What is the capital of France?',
        model: 'google/gemini-2.0-flash-001',
        temperature: 0.5,
      };

      const result = await controller.simpleTextCompletion(request);

      expect(result).toEqual(mockChatResponse);
      expect(openRouterService.simpleTextCompletion).toHaveBeenCalledWith(
        request.message,
        request.model,
        request.temperature,
      );
    });
  });

  describe('analyzeImage', () => {
    it('should return image analysis response', async () => {
      const request: ImageAnalysisRequestDto = {
        imageUrl: 'https://example.com/image.jpg',
        question: 'What is in this image?',
        model: 'google/gemini-2.0-flash-001',
      };

      const result = await controller.analyzeImage(request);

      expect(result).toEqual(mockChatResponse);
      expect(openRouterService.imageAnalysis).toHaveBeenCalledWith(
        request.imageUrl,
        request.question,
        request.model,
      );
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status', async () => {
      const result = await controller.healthCheck();

      expect(result).toEqual({
        status: 'healthy',
        openrouter: true,
      });
      expect(openRouterService.healthCheck).toHaveBeenCalled();
    });

    it('should return unhealthy status when service is down', async () => {
      mockOpenRouterService.healthCheck.mockResolvedValueOnce(false);

      const result = await controller.healthCheck();

      expect(result).toEqual({
        status: 'unhealthy',
        openrouter: false,
      });
    });
  });
});
