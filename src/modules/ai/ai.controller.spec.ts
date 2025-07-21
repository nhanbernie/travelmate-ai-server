import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { AIController } from './ai.controller';
import { OpenRouterService } from './services/openrouter.service';
import { TravelAIService } from './services/travel-ai.service';
import {
  SimpleTextRequestDto,
  ImageAnalysisRequestDto,
  TravelPlanRequestDto,
  MessageRole,
  ContentType,
} from './dto/ai-chat.dto';

describe('AIController', () => {
  let controller: AIController;
  let openRouterService: OpenRouterService;
  let travelAIService: TravelAIService;

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

  const mockTravelAIService = {
    generateTravelPlan: jest.fn().mockResolvedValue(mockChatResponse),
    getDestinationInfo: jest.fn().mockResolvedValue(mockChatResponse),
    analyzeDestinationImage: jest.fn().mockResolvedValue(mockChatResponse),
    generateItinerary: jest.fn().mockResolvedValue(mockChatResponse),
    getLocalRecommendations: jest.fn().mockResolvedValue(mockChatResponse),
    getBudgetEstimate: jest.fn().mockResolvedValue(mockChatResponse),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        'openrouter.apiKey': 'test-api-key',
        'openrouter.baseUrl': 'https://openrouter.ai/api/v1',
        'openrouter.siteUrl': 'http://localhost:3333',
        'openrouter.siteName': 'TravelMate AI Test',
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
          provide: TravelAIService,
          useValue: mockTravelAIService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<AIController>(AIController);
    openRouterService = module.get<OpenRouterService>(OpenRouterService);
    travelAIService = module.get<TravelAIService>(TravelAIService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('simpleTextCompletion', () => {
    it('should return AI response for text completion', async () => {
      const request: SimpleTextRequestDto = {
        message: 'Test message',
        model: 'google/gemini-2.0-flash-001',
        temperature: 0.7,
      };

      const result = await controller.simpleTextCompletion(request);

      expect(result).toEqual(mockChatResponse);
      expect(openRouterService.simpleTextCompletion).toHaveBeenCalledWith(
        request.message,
        request.model,
        request.temperature,
      );
    });

    it('should handle errors in text completion', async () => {
      const request: SimpleTextRequestDto = {
        message: 'Test message',
      };

      mockOpenRouterService.simpleTextCompletion.mockRejectedValueOnce(
        new Error('API Error'),
      );

      await expect(controller.simpleTextCompletion(request)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('analyzeImage', () => {
    it('should return AI response for image analysis', async () => {
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

  describe('generateTravelPlan', () => {
    it('should return travel plan', async () => {
      const request: TravelPlanRequestDto = {
        destination: 'Tokyo, Japan',
        duration: '7 days',
        budget: '$2000',
        interests: 'culture, food',
        travelStyle: 'mid-range',
      };

      const result = await controller.generateTravelPlan(request);

      expect(result).toEqual(mockChatResponse);
      expect(travelAIService.generateTravelPlan).toHaveBeenCalledWith(
        request.destination,
        request.duration,
        request.budget,
        request.interests,
        request.travelStyle,
        request.model,
      );
    });
  });

  describe('getDestinationInfo', () => {
    it('should return destination information', async () => {
      const destination = 'Paris, France';
      const model = 'google/gemini-2.0-flash-001';

      const result = await controller.getDestinationInfo(destination, model);

      expect(result).toEqual(mockChatResponse);
      expect(travelAIService.getDestinationInfo).toHaveBeenCalledWith(
        destination,
        model,
      );
    });

    it('should throw error if destination is missing', async () => {
      await expect(
        controller.getDestinationInfo('', undefined),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('generateItinerary', () => {
    it('should return itinerary', async () => {
      const destination = 'London, UK';
      const days = '5';
      const interests = 'history,art';
      const model = 'google/gemini-2.0-flash-001';

      const result = await controller.generateItinerary(
        destination,
        days,
        interests,
        model,
      );

      expect(result).toEqual(mockChatResponse);
      expect(travelAIService.generateItinerary).toHaveBeenCalledWith(
        destination,
        5,
        ['history', 'art'],
        model,
      );
    });

    it('should throw error for invalid days', async () => {
      await expect(
        controller.generateItinerary('Paris', 'invalid', undefined, undefined),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getLocalRecommendations', () => {
    it('should return recommendations', async () => {
      const destination = 'New York';
      const category = 'restaurants';
      const model = 'google/gemini-2.0-flash-001';

      const result = await controller.getLocalRecommendations(
        destination,
        category as any,
        model,
      );

      expect(result).toEqual(mockChatResponse);
      expect(travelAIService.getLocalRecommendations).toHaveBeenCalledWith(
        destination,
        category,
        model,
      );
    });

    it('should throw error for invalid category', async () => {
      await expect(
        controller.getLocalRecommendations(
          'Paris',
          'invalid' as any,
          undefined,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getBudgetEstimate', () => {
    it('should return budget estimate', async () => {
      const destination = 'Tokyo';
      const duration = '7 days';
      const style = 'mid-range';
      const groupSize = '2';
      const model = 'google/gemini-2.0-flash-001';

      const result = await controller.getBudgetEstimate(
        destination,
        duration,
        style as any,
        groupSize,
        model,
      );

      expect(result).toEqual(mockChatResponse);
      expect(travelAIService.getBudgetEstimate).toHaveBeenCalledWith(
        destination,
        duration,
        style,
        2,
        model,
      );
    });

    it('should throw error for invalid group size', async () => {
      await expect(
        controller.getBudgetEstimate(
          'Paris',
          '5 days',
          'budget',
          'invalid',
          undefined,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('healthCheck', () => {
    it('should return health status', async () => {
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
